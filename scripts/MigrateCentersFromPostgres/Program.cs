using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Npgsql;

// ----- Config -----
var basePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "src", "NikahSalon.API");
if (!Directory.Exists(basePath))
    basePath = Path.Combine(Directory.GetCurrentDirectory(), "src", "NikahSalon.API");
if (!Directory.Exists(basePath))
    basePath = Directory.GetCurrentDirectory();

var configPg = new ConfigurationBuilder().SetBasePath(basePath).AddJsonFile("appsettings.json", optional: false).Build();
var pgConnStr = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING")
    ?? Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? configPg.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(pgConnStr))
{
    var pgPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
    if (!string.IsNullOrEmpty(pgPass))
    {
        var pgBuilder = new NpgsqlConnectionStringBuilder(pgConnStr) { Password = pgPass };
        pgConnStr = pgBuilder.ConnectionString;
    }
}

var config = new ConfigurationBuilder()
    .SetBasePath(basePath)
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .Build();
var sqlConnStr = config.GetConnectionString("SqlServer") ?? Environment.GetEnvironmentVariable("SqlServerConnection");
if (string.IsNullOrWhiteSpace(sqlConnStr))
    sqlConnStr = "Server=(localdb)\\mssqllocaldb;Database=nikahsalon;Trusted_Connection=True;TrustServerCertificate=true;";
if (!sqlConnStr.Contains("Database=nikahsalon", StringComparison.OrdinalIgnoreCase))
    sqlConnStr = System.Text.RegularExpressions.Regex.Replace(sqlConnStr, "Database=[^;]+", "Database=nikahsalon", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

if (string.IsNullOrWhiteSpace(pgConnStr))
{
    Console.WriteLine("Hata: ConnectionStrings:DefaultConnection (PostgreSQL) gerekli.");
    return 1;
}

static HashSet<Guid> GetExistingIds(SqlConnection sql, string table, string idColumn = "Id")
{
    var set = new HashSet<Guid>();
    try
    {
        using var cmd = new SqlCommand($"SELECT [{idColumn}] FROM [{table}]", sql);
        using var r = cmd.ExecuteReader();
        while (r.Read()) set.Add(r.GetGuid(0));
    }
    catch { /* tablo yoksa bos don */ }
    return set;
}

static DateTime ToUtc(DateTime d) =>
    d.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(d, DateTimeKind.Utc) : d;

var totalInserted = 0;
var totalSkippedExists = 0;
var totalSkippedFk = 0;

await using (var pg = new NpgsqlConnection(pgConnStr))
{
    await pg.OpenAsync();
    using (var sql = new SqlConnection(sqlConnStr))
    {
        await sql.OpenAsync();

        // ---- 1. Centers ----
        Console.WriteLine("1/6 Centers...");
        var centers = new List<(Guid Id, string Name, string Address, string Description, string ImageUrl, DateTime CreatedAt)>();
        try
        {
            await using var cmd = new NpgsqlCommand(@"SELECT ""Id"", ""Name"", ""Address"", ""Description"", ""ImageUrl"", ""CreatedAt"" FROM ""Centers""", pg);
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                centers.Add((r.GetGuid(0), r.GetString(1), r.GetString(2), r.GetString(3), r.IsDBNull(4) ? "" : r.GetString(4), ToUtc(r.GetDateTime(5))));
        }
        catch (NpgsqlException ex) { Console.WriteLine($"  Postgres okunamadi: {ex.Message}"); }
        var centerIds = GetExistingIds(sql, "Centers");
        int ins = 0, skip = 0;
        foreach (var c in centers)
        {
            if (centerIds.Contains(c.Id)) { skip++; continue; }
            try
            {
                using var ic = new SqlCommand(@"INSERT INTO [Centers] ([Id],[Name],[Address],[Description],[ImageUrl],[CreatedAt]) VALUES (@Id,@Name,@Address,@Description,@ImageUrl,@CreatedAt)", sql);
                ic.Parameters.AddWithValue("@Id", c.Id);
                ic.Parameters.AddWithValue("@Name", c.Name);
                ic.Parameters.AddWithValue("@Address", c.Address);
                ic.Parameters.AddWithValue("@Description", c.Description);
                ic.Parameters.AddWithValue("@ImageUrl", c.ImageUrl ?? "");
                ic.Parameters.AddWithValue("@CreatedAt", c.CreatedAt);
                ic.ExecuteNonQuery();
                ins++; centerIds.Add(c.Id);
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601) { skip++; }
        }
        totalInserted += ins; totalSkippedExists += skip;
        Console.WriteLine($"  Okunan: {centers.Count}, Eklenen: {ins}, Zaten var: {skip}");

        // ---- 2. WeddingHalls ----
        Console.WriteLine("2/6 WeddingHalls...");
        var halls = new List<(Guid Id, Guid CenterId, string Name, string Address, int Capacity, string Description, string ImageUrl, string TechnicalDetails)>();
        try
        {
            await using var cmd = new NpgsqlCommand(@"SELECT ""Id"", ""CenterId"", ""Name"", ""Address"", ""Capacity"", ""Description"", ""ImageUrl"", ""TechnicalDetails"" FROM ""WeddingHalls""", pg);
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                halls.Add((r.GetGuid(0), r.GetGuid(1), r.GetString(2), r.GetString(3), r.GetInt32(4), r.GetString(5), r.IsDBNull(6) ? "" : r.GetString(6), r.IsDBNull(7) ? "" : r.GetString(7)));
        }
        catch (NpgsqlException ex) { Console.WriteLine($"  Postgres okunamadi: {ex.Message}"); }
        var hallIds = GetExistingIds(sql, "WeddingHalls");
        ins = 0; skip = 0; int fkSkip = 0;
        foreach (var h in halls)
        {
            if (hallIds.Contains(h.Id)) { skip++; continue; }
            if (!centerIds.Contains(h.CenterId)) { fkSkip++; totalSkippedFk++; continue; }
            try
            {
                using var ic = new SqlCommand(@"INSERT INTO [WeddingHalls] ([Id],[CenterId],[Name],[Address],[Capacity],[Description],[ImageUrl],[TechnicalDetails]) VALUES (@Id,@CenterId,@Name,@Address,@Capacity,@Description,@ImageUrl,@TechnicalDetails)", sql);
                ic.Parameters.AddWithValue("@Id", h.Id);
                ic.Parameters.AddWithValue("@CenterId", h.CenterId);
                ic.Parameters.AddWithValue("@Name", h.Name);
                ic.Parameters.AddWithValue("@Address", h.Address);
                ic.Parameters.AddWithValue("@Capacity", h.Capacity);
                ic.Parameters.AddWithValue("@Description", h.Description);
                ic.Parameters.AddWithValue("@ImageUrl", h.ImageUrl ?? "");
                ic.Parameters.AddWithValue("@TechnicalDetails", h.TechnicalDetails ?? "");
                ic.ExecuteNonQuery();
                ins++; hallIds.Add(h.Id);
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601) { skip++; }
        }
        totalInserted += ins; totalSkippedExists += skip;
        Console.WriteLine($"  Okunan: {halls.Count}, Eklenen: {ins}, Zaten var: {skip}, FK yok (atlandi): {fkSkip}");

        // SQL Server'da mevcut kullanici Id'leri (HallAccesses/Requests/Messages icin)
        var userIds = GetExistingIds(sql, "AspNetUsers", "Id");
        if (userIds.Count == 0)
            Console.WriteLine("  Uyari: AspNetUsers bos; HallAccesses/Requests/Messages satirlari FK nedeniyle atlanacak.");

        // ---- 3. HallAccesses ----
        Console.WriteLine("3/6 HallAccesses...");
        var accesses = new List<(Guid Id, Guid HallId, Guid UserId, DateTime CreatedAt)>();
        try
        {
            await using var cmd = new NpgsqlCommand(@"SELECT ""Id"", ""HallId"", ""UserId"", ""CreatedAt"" FROM ""HallAccesses""", pg);
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                accesses.Add((r.GetGuid(0), r.GetGuid(1), r.GetGuid(2), ToUtc(r.GetDateTime(3))));
        }
        catch (NpgsqlException ex) { Console.WriteLine($"  Postgres okunamadi: {ex.Message}"); }
        var accessIds = GetExistingIds(sql, "HallAccesses");
        ins = 0; skip = 0; fkSkip = 0;
        foreach (var a in accesses)
        {
            if (accessIds.Contains(a.Id)) { skip++; continue; }
            if (!hallIds.Contains(a.HallId) || !userIds.Contains(a.UserId)) { fkSkip++; totalSkippedFk++; continue; }
            try
            {
                using var ic = new SqlCommand(@"INSERT INTO [HallAccesses] ([Id],[HallId],[UserId],[CreatedAt]) VALUES (@Id,@HallId,@UserId,@CreatedAt)", sql);
                ic.Parameters.AddWithValue("@Id", a.Id);
                ic.Parameters.AddWithValue("@HallId", a.HallId);
                ic.Parameters.AddWithValue("@UserId", a.UserId);
                ic.Parameters.AddWithValue("@CreatedAt", a.CreatedAt);
                ic.ExecuteNonQuery();
                ins++; accessIds.Add(a.Id);
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601) { skip++; }
        }
        totalInserted += ins; totalSkippedExists += skip;
        Console.WriteLine($"  Okunan: {accesses.Count}, Eklenen: {ins}, Zaten var: {skip}, FK yok (atlandi): {fkSkip}");

        // ---- 4. Schedules ----
        Console.WriteLine("4/6 Schedules...");
        var schedules = new List<(Guid Id, Guid WeddingHallId, DateOnly Date, TimeOnly StartTime, TimeOnly EndTime, int Status, Guid? CreatedByUserId, int? EventType, string? EventName, string? EventOwner)>();
        try
        {
            await using var cmd = new NpgsqlCommand(@"SELECT ""Id"", ""WeddingHallId"", ""Date"", ""StartTime"", ""EndTime"", ""Status"", ""CreatedByUserId"", ""EventType"", ""EventName"", ""EventOwner"" FROM ""Schedules""", pg);
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
            {
                Guid? cb = r.IsDBNull(6) ? null : r.GetGuid(6);
                int? et = r.IsDBNull(7) ? null : r.GetInt32(7);
                var date = DateOnly.FromDateTime(r.GetDateTime(2));
                var startTime = TimeOnly.FromTimeSpan(r.GetFieldValue<TimeSpan>(3));
                var endTime = TimeOnly.FromTimeSpan(r.GetFieldValue<TimeSpan>(4));
                schedules.Add((r.GetGuid(0), r.GetGuid(1), date, startTime, endTime, r.GetInt32(5), cb, et, r.IsDBNull(8) ? null : r.GetString(8), r.IsDBNull(9) ? null : r.GetString(9)));
            }
        }
        catch (NpgsqlException ex) { Console.WriteLine($"  Postgres okunamadi: {ex.Message}"); }
        var schedIds = GetExistingIds(sql, "Schedules");
        ins = 0; skip = 0; fkSkip = 0;
        foreach (var s in schedules)
        {
            if (schedIds.Contains(s.Id)) { skip++; continue; }
            if (!hallIds.Contains(s.WeddingHallId) || (s.CreatedByUserId.HasValue && !userIds.Contains(s.CreatedByUserId.Value))) { fkSkip++; totalSkippedFk++; continue; }
            try
            {
                using var ic = new SqlCommand(@"INSERT INTO [Schedules] ([Id],[WeddingHallId],[Date],[StartTime],[EndTime],[Status],[CreatedByUserId],[EventType],[EventName],[EventOwner]) VALUES (@Id,@Wh,@Date,@St,@Et,@Status,@Cb,@EvT,@EvN,@EvO)", sql);
                ic.Parameters.AddWithValue("@Id", s.Id);
                ic.Parameters.AddWithValue("@Wh", s.WeddingHallId);
                ic.Parameters.AddWithValue("@Date", s.Date);
                ic.Parameters.AddWithValue("@St", s.StartTime);
                ic.Parameters.AddWithValue("@Et", s.EndTime);
                ic.Parameters.AddWithValue("@Status", s.Status);
                ic.Parameters.AddWithValue("@Cb", (object?)s.CreatedByUserId ?? DBNull.Value);
                ic.Parameters.AddWithValue("@EvT", (object?)s.EventType ?? DBNull.Value);
                ic.Parameters.AddWithValue("@EvN", (object?)s.EventName ?? DBNull.Value);
                ic.Parameters.AddWithValue("@EvO", (object?)s.EventOwner ?? DBNull.Value);
                ic.ExecuteNonQuery();
                ins++; schedIds.Add(s.Id);
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601) { skip++; }
        }
        totalInserted += ins; totalSkippedExists += skip;
        Console.WriteLine($"  Okunan: {schedules.Count}, Eklenen: {ins}, Zaten var: {skip}, FK yok: {fkSkip}");

        // ---- 5. Requests ----
        Console.WriteLine("5/6 Requests...");
        var requests = new List<(Guid Id, Guid WeddingHallId, Guid CreatedByUserId, string Message, int Status, DateTime CreatedAt, int EventType, string EventName, string EventOwner, DateOnly EventDate, TimeOnly EventTime)>();
        try
        {
            await using var cmd = new NpgsqlCommand(@"SELECT ""Id"", ""WeddingHallId"", ""CreatedByUserId"", ""Message"", ""Status"", ""CreatedAt"", ""EventType"", ""EventName"", ""EventOwner"", ""EventDate"", ""EventTime"" FROM ""Requests""", pg);
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
            {
                var eventDate = DateOnly.FromDateTime(r.GetDateTime(9));
                var eventTime = TimeOnly.FromTimeSpan(r.GetFieldValue<TimeSpan>(10));
                requests.Add((r.GetGuid(0), r.GetGuid(1), r.GetGuid(2), r.GetString(3), r.GetInt32(4), ToUtc(r.GetDateTime(5)), r.GetInt32(6), r.GetString(7), r.GetString(8), eventDate, eventTime));
            }
        }
        catch (NpgsqlException ex) { Console.WriteLine($"  Postgres okunamadi: {ex.Message}"); }
        var requestIds = GetExistingIds(sql, "Requests");
        ins = 0; skip = 0; fkSkip = 0;
        foreach (var q in requests)
        {
            if (requestIds.Contains(q.Id)) { skip++; continue; }
            if (!hallIds.Contains(q.WeddingHallId) || !userIds.Contains(q.CreatedByUserId)) { fkSkip++; totalSkippedFk++; continue; }
            try
            {
                using var ic = new SqlCommand(@"INSERT INTO [Requests] ([Id],[WeddingHallId],[CreatedByUserId],[Message],[Status],[CreatedAt],[EventType],[EventName],[EventOwner],[EventDate],[EventTime]) VALUES (@Id,@Wh,@Cb,@Msg,@Status,@Ca,@Et,@En,@Eo,@Ed,@Eti)", sql);
                ic.Parameters.AddWithValue("@Id", q.Id);
                ic.Parameters.AddWithValue("@Wh", q.WeddingHallId);
                ic.Parameters.AddWithValue("@Cb", q.CreatedByUserId);
                ic.Parameters.AddWithValue("@Msg", q.Message ?? "");
                ic.Parameters.AddWithValue("@Status", q.Status);
                ic.Parameters.AddWithValue("@Ca", q.CreatedAt);
                ic.Parameters.AddWithValue("@Et", q.EventType);
                ic.Parameters.AddWithValue("@En", q.EventName ?? "");
                ic.Parameters.AddWithValue("@Eo", q.EventOwner ?? "");
                ic.Parameters.AddWithValue("@Ed", q.EventDate);
                ic.Parameters.AddWithValue("@Eti", q.EventTime);
                ic.ExecuteNonQuery();
                ins++; requestIds.Add(q.Id);
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601) { skip++; }
        }
        totalInserted += ins; totalSkippedExists += skip;
        Console.WriteLine($"  Okunan: {requests.Count}, Eklenen: {ins}, Zaten var: {skip}, FK yok: {fkSkip}");

        // ---- 6. Messages ----
        Console.WriteLine("6/6 Messages...");
        var messages = new List<(Guid Id, Guid RequestId, Guid SenderUserId, string Content, DateTime CreatedAt)>();
        try
        {
            await using var cmd = new NpgsqlCommand(@"SELECT ""Id"", ""RequestId"", ""SenderUserId"", ""Content"", ""CreatedAt"" FROM ""Messages""", pg);
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                messages.Add((r.GetGuid(0), r.GetGuid(1), r.GetGuid(2), r.GetString(3), ToUtc(r.GetDateTime(4))));
        }
        catch (NpgsqlException ex) { Console.WriteLine($"  Postgres okunamadi: {ex.Message}"); }
        var msgIds = GetExistingIds(sql, "Messages");
        ins = 0; skip = 0; fkSkip = 0;
        foreach (var m in messages)
        {
            if (msgIds.Contains(m.Id)) { skip++; continue; }
            if (!requestIds.Contains(m.RequestId) || !userIds.Contains(m.SenderUserId)) { fkSkip++; totalSkippedFk++; continue; }
            try
            {
                using var ic = new SqlCommand(@"INSERT INTO [Messages] ([Id],[RequestId],[SenderUserId],[Content],[CreatedAt]) VALUES (@Id,@Req,@Send,@Content,@Ca)", sql);
                ic.Parameters.AddWithValue("@Id", m.Id);
                ic.Parameters.AddWithValue("@Req", m.RequestId);
                ic.Parameters.AddWithValue("@Send", m.SenderUserId);
                ic.Parameters.AddWithValue("@Content", m.Content ?? "");
                ic.Parameters.AddWithValue("@Ca", m.CreatedAt);
                ic.ExecuteNonQuery();
                ins++; msgIds.Add(m.Id);
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601) { skip++; }
        }
        totalInserted += ins; totalSkippedExists += skip;
        Console.WriteLine($"  Okunan: {messages.Count}, Eklenen: {ins}, Zaten var: {skip}, FK yok: {fkSkip}");
    }
}

Console.WriteLine();
Console.WriteLine($"Ozet: Toplam eklenen kayit: {totalInserted}, Zaten var (atlandi): {totalSkippedExists}, FK eksik (atlandi): {totalSkippedFk}");
Console.WriteLine("Tamam.");
return 0;
