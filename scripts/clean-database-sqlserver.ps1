# SQL Server (LocalDB) icinde nikahsalon veritabanini tamamen siler.
# Sonra migration'lari sifirdan uygulayabilirsiniz.
# Kullanim: .\scripts\clean-database-sqlserver.ps1

$connStr = $env:SqlServerConnection
if (-not $connStr) {
    # LocalDB kapali olabilir; once baslat
    $sqllocaldb = Get-Command sqllocaldb -ErrorAction SilentlyContinue
    if ($sqllocaldb) {
        & sqllocaldb start mssqllocaldb 2>$null
        Start-Sleep -Seconds 2
    }

    # Bazi sistemlerde instance adi MSSQLLocalDB (buyuk harf) veya pipe gerekir
    $servers = @(
        "Server=(localdb)\mssqllocaldb;Database=master;Trusted_Connection=True;TrustServerCertificate=true;",
        "Server=(localdb)\MSSQLLocalDB;Database=master;Trusted_Connection=True;TrustServerCertificate=true;"
    )
    if ($sqllocaldb) {
        $info = & sqllocaldb info mssqllocaldb 2>$null
        if ($info -match "Instance pipe name:\s*(.+)") {
            $pipe = $Matches[1].Trim()
            # Connection string'de \ kacis karakteri; pipe icin \\ kullan
            $pipeEscaped = $pipe -replace '\\', '\\\\'
            $servers += "Server=$pipeEscaped;Database=master;Trusted_Connection=True;TrustServerCertificate=true;"
        }
    }

    $conn = $null
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
        Write-Host "Hata: LocalDB'ye baglanilamadi. Asagidaki sunucu adlarini denedik: (localdb)\mssqllocaldb, (localdb)\MSSQLLocalDB" -ForegroundColor Red
        Write-Host "sqllocaldb info mssqllocaldb ciktisindaki 'Instance pipe name' degerini Server= olarak deneyebilirsiniz." -ForegroundColor Yellow
        exit 1
    }
}

# master'a baglan (nikahsalon degil)
if ($connStr -match "Database=[^;]+") {
    $connStr = $connStr -replace "Database=[^;]+", "Database=master"
}

try {
    if (-not $conn) {
        $conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
        $conn.Open()
    }

    # Veritabani var mi?
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT 1 FROM sys.databases WHERE name = N'nikahsalon'"
    $exists = $cmd.ExecuteScalar()

    if ($exists) {
        Write-Host "Veritabani 'nikahsalon' siliniyor..." -ForegroundColor Yellow
        $cmd.CommandText = @"
ALTER DATABASE [nikahsalon] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [nikahsalon];
"@
        $cmd.ExecuteNonQuery() | Out-Null
        Write-Host "Veritabani silindi." -ForegroundColor Green
    } else {
        Write-Host "Veritabani 'nikahsalon' zaten yok." -ForegroundColor Gray
    }

    $conn.Close()
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Olası nedenler:" -ForegroundColor Yellow
    Write-Host "  1. LocalDB yuklu degil veya calismiyor. Visual Studio veya SQL Server Express kurun; veya PowerShell'de: sqllocaldb start mssqllocaldb"
    Write-Host "  2. Farkli SQL Server kullaniyorsaniz ortam degiskeni verin:"
    Write-Host '     $env:SqlServerConnection = "Server=localhost;Database=master;User Id=sa;Password=SIFRENIZ;TrustServerCertificate=true;"'
    Write-Host "  3. SSMS / Azure Data Studio ile veritabanini elle silebilirsiniz (nikahsalon sag tik -> Delete)."
    exit 1
}
