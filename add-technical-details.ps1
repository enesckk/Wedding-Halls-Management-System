# TechnicalDetails kolonu ekleme scripti
# Bu scripti çalıştırmadan önce Docker Desktop'ın çalıştığından emin olun

Write-Host "=== TechnicalDetails Kolonu Ekleme ===" -ForegroundColor Cyan

# Docker container kontrolü
$containerRunning = docker ps --filter "name=sehitkamil_db" --format "{{.Names}}" 2>$null

if ($containerRunning -eq "sehitkamil_db") {
    Write-Host "Container bulundu. Kolon ekleniyor..." -ForegroundColor Yellow
    
    # Kolonu ekle
    docker exec sehitkamil_db psql -U enescikcik -d nikahsalon -c "ALTER TABLE `"WeddingHalls`" ADD COLUMN IF NOT EXISTS `"TechnicalDetails`" TEXT NOT NULL DEFAULT '';"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ TechnicalDetails kolonu başarıyla eklendi!" -ForegroundColor Green
        Write-Host "Backend API'yi yeniden başlatın." -ForegroundColor Yellow
    } else {
        Write-Host "✗ Hata oluştu. Lütfen manuel olarak SQL komutunu çalıştırın." -ForegroundColor Red
    }
} else {
    Write-Host "✗ sehitkamil_db container'ı bulunamadı veya çalışmıyor." -ForegroundColor Red
    Write-Host "Lütfen Docker Desktop'ı başlatın ve container'ın çalıştığından emin olun." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manuel SQL komutu:" -ForegroundColor Cyan
    Write-Host 'docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon -c "ALTER TABLE \"WeddingHalls\" ADD COLUMN IF NOT EXISTS \"TechnicalDetails\" TEXT NOT NULL DEFAULT '''';"' -ForegroundColor White
}
