# AddCentersAndHallAccess migration EF ile uygulanmiyorsa bu script tablolari ve kaydi elle olusturur.
# Kullanim: .\scripts\apply-add-centers-hallaccess-sqlserver.ps1

$connStr = $env:SqlServerConnection
if (-not $connStr) {
    $sqllocaldb = Get-Command sqllocaldb -ErrorAction SilentlyContinue
    if ($sqllocaldb) {
        & sqllocaldb start mssqllocaldb 2>$null
        Start-Sleep -Seconds 1
        $info = & sqllocaldb info mssqllocaldb 2>$null
        $pipe = $null
        foreach ($line in @($info)) {
            if ($line -match "Instance pipe name:\s*(.+)") {
                $pipe = $Matches[1].Trim() -replace '\\', '\\\\'
                break
            }
        }
        if ($pipe) {
            $connStr = "Server=$pipe;Database=nikahsalon;Trusted_Connection=True;TrustServerCertificate=true;"
        } else {
            $connStr = "Server=(localdb)\mssqllocaldb;Database=nikahsalon;Trusted_Connection=True;TrustServerCertificate=true;"
        }
    } else {
        $connStr = "Server=(localdb)\mssqllocaldb;Database=nikahsalon;Trusted_Connection=True;TrustServerCertificate=true;"
    }
}
if ($connStr -notmatch "Database=nikahsalon") {
    $connStr = $connStr -replace "Database=[^;]+", "Database=nikahsalon"
}

$defaultCenterId = "00000000-0000-0000-0000-000000000001"

# Batch 1: Centers tablosu + WeddingHalls.CenterId (SQL Server tek batch'te yeni kolonu hemen goremiyor)
$batch1 = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Centers')
BEGIN
    CREATE TABLE [Centers] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Address] nvarchar(500) NOT NULL,
        [Description] nvarchar(2000) NOT NULL,
        [ImageUrl] nvarchar(max) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Centers] PRIMARY KEY ([Id])
    );
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.WeddingHalls') AND name = 'CenterId')
    ALTER TABLE [WeddingHalls] ADD [CenterId] uniqueidentifier NULL;
"@

# Batch 2: Varsayilan merkez, UPDATE, NOT NULL, index, FK, HallAccesses, migration kaydi
$batch2 = @"
IF NOT EXISTS (SELECT 1 FROM [Centers] WHERE [Id] = '$defaultCenterId')
    INSERT INTO [Centers] ([Id], [Name], [Address], [Description], [ImageUrl], [CreatedAt])
    VALUES ('$defaultCenterId', N'Varsayilan Merkez', N'Adres belirtilmemis', N'Mevcut salonlar icin olusturulan varsayilan merkez', N'', GETUTCDATE());
UPDATE [WeddingHalls] SET [CenterId] = '$defaultCenterId' WHERE [CenterId] IS NULL;
ALTER TABLE [WeddingHalls] ALTER COLUMN [CenterId] uniqueidentifier NOT NULL;
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WeddingHalls_CenterId' AND object_id = OBJECT_ID('dbo.WeddingHalls'))
    CREATE INDEX [IX_WeddingHalls_CenterId] ON [WeddingHalls] ([CenterId]);
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_WeddingHalls_Centers_CenterId')
    ALTER TABLE [WeddingHalls] ADD CONSTRAINT [FK_WeddingHalls_Centers_CenterId] FOREIGN KEY ([CenterId]) REFERENCES [Centers] ([Id]);
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HallAccesses')
BEGIN
    CREATE TABLE [HallAccesses] (
        [Id] uniqueidentifier NOT NULL,
        [HallId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_HallAccesses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_HallAccesses_WeddingHalls_HallId] FOREIGN KEY ([HallId]) REFERENCES [WeddingHalls] ([Id]) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX [IX_HallAccesses_HallId_UserId] ON [HallAccesses] ([HallId], [UserId]);
END
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260129000000_AddCentersAndHallAccess')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260129000000_AddCentersAndHallAccess', '8.0.11');
"@

try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
    $conn.Open()
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $batch1
    $cmd.ExecuteNonQuery() | Out-Null
    $cmd.CommandText = $batch2
    $cmd.ExecuteNonQuery() | Out-Null
    $conn.Close()
    Write-Host "AddCentersAndHallAccess SQL Server uzerinde uygulandi (Centers, HallAccesses, WeddingHalls.CenterId)." -ForegroundColor Green
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
}
