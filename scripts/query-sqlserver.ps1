# nikahsalon veritabaninda basit SELECT calistirir (eklenti kurmadan veri gormek icin).
# Kullanim: .\scripts\query-sqlserver.ps1 "SELECT TOP 10 * FROM AspNetUsers"
#         .\scripts\query-sqlserver.ps1 "SELECT COUNT(*) FROM WeddingHalls"
# Pipe gerekirse: $env:SqlServerConnection = 'Server=np:\\.\pipe\LOCALDB#XXXX\tsql\query;Database=nikahsalon;...'

$query = $args[0]
if (-not $query) {
    Write-Host "Kullanim: .\scripts\query-sqlserver.ps1 ""SELECT TOP 10 * FROM TabloAdi""" -ForegroundColor Yellow
    exit 1
}

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
    $cmd.CommandText = $query
    $rd = $cmd.ExecuteReader()
    $cols = @()
    for ($i = 0; $i -lt $rd.FieldCount; $i++) { $cols += $rd.GetName($i) }
    Write-Host ($cols -join "`t") -ForegroundColor Cyan
    while ($rd.Read()) {
        $row = @()
        for ($i = 0; $i -lt $rd.FieldCount; $i++) {
            $v = $rd[$i]
            if ($v -is [DBNull] -or $null -eq $v) { $row += "" } else { $row += $v.ToString() }
        }
        Write-Host ($row -join "`t")
    }
    $rd.Close()
    $conn.Close()
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
    if (-not $env:SqlServerConnection) {
        Write-Host "Pipe ile deneyin: sqllocaldb info mssqllocaldb -> Instance pipe name" -ForegroundColor Yellow
    }
}
