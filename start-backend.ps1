# Backend ve Frontend'i Birlikte Başlatma Script'i
# Kullanım: .\start-backend.ps1

Write-Host "🚀 Wedding Hall Management System - Başlatılıyor..." -ForegroundColor Cyan

# Backend proje yolu (kendi yolunuza göre güncelleyin)
$backendPath = "..\wedding-hall-api"

# Frontend proje yolu (mevcut klasör)
$frontendPath = $PSScriptRoot

# Backend klasörünün varlığını kontrol et
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend klasörü bulunamadı: $backendPath" -ForegroundColor Red
    Write-Host "💡 Lütfen backend projesinin yolunu script'te güncelleyin." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Mevcut klasör: $PSScriptRoot" -ForegroundColor Gray
    Write-Host "Backend aranan yol: $backendPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Backend projesinin tam yolunu girin:" -ForegroundColor Yellow
    $customPath = Read-Host
    if ($customPath -and (Test-Path $customPath)) {
        $backendPath = $customPath
    } else {
        Write-Host "❌ Geçersiz yol. Script sonlandırılıyor." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Backend klasörü bulundu: $backendPath" -ForegroundColor Green

# .NET SDK kontrolü
Write-Host ""
Write-Host "🔍 .NET SDK kontrol ediliyor..." -ForegroundColor Cyan
try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET SDK yüklü: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ .NET SDK bulunamadı!" -ForegroundColor Red
    Write-Host "💡 Lütfen .NET SDK'yı yükleyin: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    exit 1
}

# Node.js kontrolü
Write-Host ""
Write-Host "🔍 Node.js kontrol ediliyor..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js yüklü: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js bulunamadı!" -ForegroundColor Red
    Write-Host "💡 Lütfen Node.js'i yükleyin: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Backend'i başlat
Write-Host ""
Write-Host "🔧 Backend başlatılıyor..." -ForegroundColor Cyan
Write-Host "   Klasör: $backendPath" -ForegroundColor Gray

$backendProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host '🔵 BACKEND - Port 5230' -ForegroundColor Blue; dotnet run"
) -PassThru

# Backend'in başlaması için bekle
Write-Host "⏳ Backend'in başlaması bekleniyor (5 saniye)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Frontend'i başlat
Write-Host ""
Write-Host "🎨 Frontend başlatılıyor..." -ForegroundColor Cyan
Write-Host "   Klasör: $frontendPath" -ForegroundColor Gray

$frontendProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; Write-Host '🟢 FRONTEND - Port 3000' -ForegroundColor Green; npm run dev"
) -PassThru

Write-Host ""
Write-Host "✅ Her iki proje de başlatıldı!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Erişim URL'leri:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5230" -ForegroundColor Blue
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Projeleri durdurmak için PowerShell pencerelerini kapatın." -ForegroundColor Yellow
Write-Host ""

# Process ID'leri göster
Write-Host "📊 Process ID'leri:" -ForegroundColor Gray
Write-Host "   Backend PID:  $($backendProcess.Id)" -ForegroundColor Gray
Write-Host "   Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host ""
