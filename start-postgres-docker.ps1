# PostgreSQL Docker Container Baslatma Scripti

Write-Host "=== PostgreSQL Docker Container ===" -ForegroundColor Cyan
Write-Host ""

# Docker Desktop calisiyor mu kontrol et
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "HATA: Docker Desktop calismiyor!" -ForegroundColor Red
    Write-Host "Lutfen Docker Desktop'i baslatin." -ForegroundColor Yellow
    exit 1
}

# Container var mı kontrol et
$containerExists = docker ps -a --filter "name=postgres-nikahsalon" --format "{{.Names}}"

if ($containerExists -eq "postgres-nikahsalon") {
    Write-Host "Container bulundu. Durum kontrol ediliyor..." -ForegroundColor Yellow
    
    $containerRunning = docker ps --filter "name=postgres-nikahsalon" --format "{{.Names}}"
    
    if ($containerRunning -eq "postgres-nikahsalon") {
        Write-Host "Container zaten calisiyor!" -ForegroundColor Green
    } else {
        Write-Host "Container baslatiliyor..." -ForegroundColor Yellow
        docker start postgres-nikahsalon
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Container baslatildi!" -ForegroundColor Green
        } else {
            Write-Host "HATA: Container baslatilamadi!" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "Container bulunamadi. Olusturuluyor..." -ForegroundColor Yellow
    Write-Host "Sifre: 'your_password' olarak ayarlandi. Degistirmek icin scripti duzenleyin." -ForegroundColor Cyan
    
    docker run --name postgres-nikahsalon `
      -e POSTGRES_USER=enescikcik `
      -e POSTGRES_PASSWORD=your_password `
      -e POSTGRES_DB=nikahsalon `
      -p 5432:5432 `
      -v postgres-data:/var/lib/postgresql/data `
      -d postgres:15
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Container olusturuldu ve baslatildi!" -ForegroundColor Green
        Write-Host "Ilk baslatma biraz zaman alabilir..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "HATA: Container olusturulamadi!" -ForegroundColor Red
        exit 1
    }
}

# Durum kontrolu
Write-Host "`nContainer durumu:" -ForegroundColor Cyan
docker ps --filter "name=postgres-nikahsalon" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Baglanti testi
Write-Host "`nBaglanti testi yapiliyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$testResult = docker exec postgres-nikahsalon pg_isready -U enescikcik 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL hazir!" -ForegroundColor Green
} else {
    Write-Host "UYARI: PostgreSQL henuz hazir degil. Biraz bekleyin..." -ForegroundColor Yellow
}

Write-Host "`n=== Tamamlandi ===" -ForegroundColor Cyan
Write-Host "Backend'i calistirabilirsiniz:" -ForegroundColor Green
Write-Host "cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API" -ForegroundColor White
Write-Host "dotnet run" -ForegroundColor White
