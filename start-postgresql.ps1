# PostgreSQL Baslatma Scripti
# Yonetici olarak calistirin!

Write-Host "=== PostgreSQL Baslatma ===" -ForegroundColor Cyan
Write-Host ""

# 1. PostgreSQL servislerini bul
$postgresServices = Get-Service -ErrorAction SilentlyContinue | Where-Object { 
    $_.DisplayName -like "*postgres*" -or 
    $_.Name -like "*postgres*" 
}

if ($postgresServices) {
    Write-Host "PostgreSQL servisleri bulundu:" -ForegroundColor Green
    $postgresServices | Format-Table Name, Status, DisplayName -AutoSize
    
    foreach ($service in $postgresServices) {
        if ($service.Status -ne 'Running') {
            Write-Host "`nServis baslatiliyor: $($service.DisplayName) ($($service.Name))" -ForegroundColor Yellow
            
            try {
                Start-Service -Name $service.Name -ErrorAction Stop
                Write-Host "Basarili! Servis baslatildi." -ForegroundColor Green
                
                # Durum kontrolu
                Start-Sleep -Seconds 2
                $status = Get-Service -Name $service.Name
                Write-Host "Durum: $($status.Status)" -ForegroundColor Cyan
            }
            catch {
                Write-Host "HATA: Servis baslatilamadi!" -ForegroundColor Red
                Write-Host "Hata mesaji: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "`nLutfen scripti YONETICI OLARAK calistirin!" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Servis zaten calisiyor: $($service.DisplayName)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "PostgreSQL servisi bulunamadi!" -ForegroundColor Red
    Write-Host "`nPostgreSQL yuklu degil gibi gorunuyor." -ForegroundColor Yellow
    Write-Host "`nYukleme adimlari:" -ForegroundColor Cyan
    Write-Host "1. https://www.postgresql.org/download/windows/ adresinden PostgreSQL indirin"
    Write-Host "2. Windows x86-64 installer'i calistirin"
    Write-Host "3. Kurulum sirasinda:" -ForegroundColor White
    Write-Host "   - Port: 5432 (varsayilan)"
    Write-Host "   - Superuser (postgres) sifresini belirleyin"
    Write-Host "   - Locale: Turkish, Turkey veya English, United States"
    Write-Host "4. Kurulum tamamlandiktan sonra bu scripti tekrar calistirin"
    Write-Host "`nVEYA PostgreSQL zaten yuklu ise, servis adini manuel olarak bulun:" -ForegroundColor Yellow
    Write-Host "   services.msc" -ForegroundColor White
}

Write-Host "`n=== Tamamlandi ===" -ForegroundColor Cyan
