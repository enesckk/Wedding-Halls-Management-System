# sqlcmd olmadan LocalDB'de nikahsalon veritabanini olusturur.
# Kullanim: .\scripts\create-database-sqlserver.ps1
# Farkli sunucu icin: $env:SqlServerConnection = "Server=localhost;..." ; .\scripts\create-database-sqlserver.ps1

$connStr = $env:SqlServerConnection
$conn = $null
if (-not $connStr) {
    $sqllocaldb = Get-Command sqllocaldb -ErrorAction SilentlyContinue
    if ($sqllocaldb) {
        & sqllocaldb start mssqllocaldb 2>$null
        Start-Sleep -Seconds 2
    }
    $servers = @(
        "Server=(localdb)\mssqllocaldb;Database=master;Trusted_Connection=True;TrustServerCertificate=true;",
        "Server=(localdb)\MSSQLLocalDB;Database=master;Trusted_Connection=True;TrustServerCertificate=true;"
    )
    if ($sqllocaldb) {
        $info = & sqllocaldb info mssqllocaldb 2>$null
        if ($info -match "Instance pipe name:\s*(.+)") {
            $pipe = $Matches[1].Trim()
            $pipeEscaped = $pipe -replace '\\', '\\\\'
            $servers += "Server=$pipeEscaped;Database=master;Trusted_Connection=True;TrustServerCertificate=true;"
        }
    }
    foreach ($cs in $servers) {
        try {
            $conn = New-Object System.Data.SqlClient.SqlConnection($cs)
            $conn.Open()
            $connStr = $cs
            break
        } catch {
            if ($conn) { $conn.Dispose(); $conn = $null }
        }
    }
    if (-not $connStr) {
        Write-Host "Hata: LocalDB'ye baglanilamadi. sqllocaldb info mssqllocaldb ile 'Instance pipe name' degerini Server= olarak deneyin." -ForegroundColor Red
        exit 1
    }
}

try {
    if (-not $conn) {
        $conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
        $conn.Open()
    }
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'nikahsalon') CREATE DATABASE [nikahsalon];"
    $cmd.ExecuteNonQuery() | Out-Null
    $conn.Close()
    Write-Host "Veritabani 'nikahsalon' hazir (zaten varsa degisiklik yapilmadi)." -ForegroundColor Green
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
    Write-Host "LocalDB yuklu olmayabilir. SSMS veya Azure Data Studio ile 'nikahsalon' veritabanini elle olusturabilirsiniz." -ForegroundColor Yellow
    exit 1
}
