# PostgreSQL Durum Kontrol ve Baslatma Scripti

Write-Host "=== PostgreSQL Durum Kontrolu ===" -ForegroundColor Cyan
Write-Host ""

# 1. PostgreSQL servislerini bul
Write-Host "1. PostgreSQL servisleri aranıyor..." -ForegroundColor Yellow
$postgresServices = Get-Service | Where-Object { 
    $_.DisplayName -like "*postgres*" -or 
    $_.Name -like "*postgres*" 
} | Select-Object Name, Status, DisplayName

if ($postgresServices) {
    Write-Host "`nBulunan PostgreSQL servisleri:" -ForegroundColor Green
    $postgresServices | Format-Table -AutoSize
    
    # İlk servisi kontrol et
    $firstService = $postgresServices | Select-Object -First 1
    Write-Host "`nKontrol edilen servis: $($firstService.DisplayName) ($($firstService.Name))" -ForegroundColor Cyan
    
    if ($firstService.Status -eq 'Running') {
        Write-Host "PostgreSQL servisi calisiyor!" -ForegroundColor Green
        
        # Port kontrolu
        Write-Host "`n2. Port 5432 kontrol ediliyor..." -ForegroundColor Yellow
        $portCheck = netstat -ano | findstr :5432
        if ($portCheck) {
            Write-Host "Port 5432 dinleniyor" -ForegroundColor Green
            Write-Host $portCheck
        } else {
            Write-Host "UYARI: Port 5432 dinlenmiyor (servis calisiyor ama port farkli olabilir)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "PostgreSQL servisi calismiyor!" -ForegroundColor Red
        Write-Host "`nServisi baslatmak icin (Yonetici olarak calistirin):" -ForegroundColor Yellow
        Write-Host "Start-Service -Name '$($firstService.Name)'" -ForegroundColor White
    }
} else {
    Write-Host "PostgreSQL servisi bulunamadi!" -ForegroundColor Red
    Write-Host "`nPostgreSQL yuklu degil gibi gorunuyor." -ForegroundColor Yellow
    Write-Host "`nYukleme adimlari:" -ForegroundColor Cyan
    Write-Host "1. https://www.postgresql.org/download/windows/ adresinden PostgreSQL indirin"
    Write-Host "2. Windows x86-64 installer'i calistirin"
    Write-Host "3. Kurulum sirasinda port 5432'yi secin"
    Write-Host "4. Superuser (postgres) sifresini belirleyin"
    Write-Host "5. Kurulum tamamlandiktan sonra bu scripti tekrar calistirin"
}

# 3. PostgreSQL process kontrolu
Write-Host "`n3. PostgreSQL process'leri kontrol ediliyor..." -ForegroundColor Yellow
$postgresProcesses = Get-Process | Where-Object { $_.ProcessName -like "*postgres*" }
if ($postgresProcesses) {
    Write-Host "PostgreSQL process'leri calisiyor:" -ForegroundColor Green
    $postgresProcesses | Select-Object ProcessName, Id | Format-Table -AutoSize
} else {
    Write-Host "PostgreSQL process'i bulunamadi" -ForegroundColor Red
}

# 4. Connection string kontrolu
Write-Host "`n4. Connection String kontrolu..." -ForegroundColor Yellow
$backendPath = "C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API"
$appsettingsPath = Join-Path $backendPath "appsettings.Development.json"

if (Test-Path $appsettingsPath) {
    $appsettings = Get-Content $appsettingsPath | ConvertFrom-Json
    $connString = $appsettings.ConnectionStrings.DefaultConnection
    
    Write-Host "Connection String:" -ForegroundColor Cyan
    Write-Host $connString -ForegroundColor White
    
    # Sifre kontrolu
    if ($connString -match "Password=") {
        $passwordPart = $connString -split "Password=" | Select-Object -Last 1
        if ([string]::IsNullOrWhiteSpace($passwordPart) -or $passwordPart -eq "") {
            Write-Host "UYARI: Connection string'de sifre bos gorunuyor!" -ForegroundColor Yellow
            Write-Host "   Eger PostgreSQL kullanicisinin sifresi varsa, appsettings.Development.json'a ekleyin" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "UYARI: appsettings.Development.json bulunamadi: $appsettingsPath" -ForegroundColor Yellow
}

Write-Host "`n=== Kontrol Tamamlandi ===" -ForegroundColor Cyan
Write-Host "`nSorun devam ederse BACKEND_REHBERI.md dosyasindaki 'Veritabani baglanti hatasi' bolumune bakin." -ForegroundColor Yellow
