using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace NikahSalon.Infrastructure.Data;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Support running from repo root (Backend) or from Infrastructure project
        var basePath = Directory.GetCurrentDirectory();
        if (!File.Exists(Path.Combine(basePath, "appsettings.json")))
        {
            var apiPath = Path.Combine(basePath, "src", "NikahSalon.API");
            if (Directory.Exists(apiPath))
                basePath = apiPath;
            else
                basePath = Path.Combine(basePath, "..", "NikahSalon.API");
        }
        var config = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        // Design-time: env var overrides config so "dotnet ef" with DatabaseProvider=SqlServer uses SQL Server
        var provider = Environment.GetEnvironmentVariable("DatabaseProvider") ?? config["DatabaseProvider"] ?? "Postgres";
        var useSqlServer = string.Equals(provider, "SqlServer", StringComparison.OrdinalIgnoreCase);

        var conn = useSqlServer
            ? (config.GetConnectionString("SqlServer") ?? Environment.GetEnvironmentVariable("SqlServerConnection"))
            : config.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(conn))
        {
            conn = Environment.GetEnvironmentVariable("CONNECTION_STRING");
        }
        if (string.IsNullOrWhiteSpace(conn))
        {
            if (useSqlServer)
                conn = "Server=(localdb)\\mssqllocaldb;Database=nikahsalon;Trusted_Connection=True;TrustServerCertificate=true;";
            else
                conn = "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=";
        }

        var options = new DbContextOptionsBuilder<AppDbContext>();
        if (useSqlServer)
            options.UseSqlServer(conn);
        else
            options.UseNpgsql(conn);

        return new AppDbContext(options.Options);
    }
}
