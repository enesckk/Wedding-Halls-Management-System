# nikahsalon veritabanindaki tablolari listeler.
# Kullanim: .\scripts\list-tables-sqlserver.ps1
# Pipe ile: $env:SqlServerConnection = 'Server=np:\\.\pipe\LOCALDB#XXXX\tsql\query;Database=nikahsalon;...' ; .\scripts\list-tables-sqlserver.ps1

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
    $cmd.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
    $rd = $cmd.ExecuteReader()
    Write-Host "Tablolar (nikahsalon):" -ForegroundColor Cyan
    while ($rd.Read()) { Write-Host "  - $($rd["TABLE_NAME"])" }
    $rd.Close()
    $conn.Close()
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
    Write-Host "SqlServerConnection ile pipe verin: sqllocaldb info mssqllocaldb ciktisindaki Instance pipe name" -ForegroundColor Yellow
}
