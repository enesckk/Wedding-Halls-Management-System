# Backend API'yi MS SQL Server (LocalDB) ile calistirir.
# appsettings.Development.json kullanilir: DatabaseProvider=SqlServer, DefaultConnection=LocalDB
# Kullanim: .\scripts\run-backend-sqlserver.ps1

$env:ASPNETCORE_ENVIRONMENT = "Development"
Set-Location $PSScriptRoot\..

Write-Host "Backend MS SQL (Development) ile baslatiliyor..." -ForegroundColor Cyan
Write-Host "  Veritabani: appsettings.Development.json -> (localdb)\mssqllocaldb, nikahsalon" -ForegroundColor Gray
Write-Host "  API: http://localhost:5230" -ForegroundColor Gray
Write-Host ""

dotnet run --project src/NikahSalon.API
