# AddCentersAndHallAccess migration'i EF tarafindan uygulanmis sayiliyor ama tablolar yok.
# Bu script __EFMigrationsHistory'den o kaydi siler; sonra "dotnet ef database update" ile migration tekrar calisir.

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

try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
    $conn.Open()
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "DELETE FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260129000000_AddCentersAndHallAccess'"
    $deleted = $cmd.ExecuteNonQuery()
    $conn.Close()
    if ($deleted -gt 0) {
        Write-Host "Migration kaydi silindi. Simdi su komutu calistirin:" -ForegroundColor Green
        Write-Host '  $env:DatabaseProvider = "SqlServer"; dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API' -ForegroundColor Cyan
    } else {
        Write-Host "Bu migration kaydi zaten yok (silinecek bisey yok)." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
}
