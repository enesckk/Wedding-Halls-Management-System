# SQL Server migration adımları
# 1) Backend klasöründe bu script'i çalıştırın: .\scripts\run-migrations-sqlserver.ps1
# 2) Geliştirme ortamında appsettings.Development.json'da DatabaseProvider: "SqlServer" ve connection string ayarlı olmalı.

$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $BackendRoot

Write-Host "Adim 1: Restore..." -ForegroundColor Cyan
dotnet restore src/NikahSalon.API/NikahSalon.API.csproj
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Adim 2: Build..." -ForegroundColor Cyan
dotnet build src/NikahSalon.API/NikahSalon.API.csproj
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Adim 3: SQL Server icin migration uygulaniyor (DesignTimeDbContextFactory appsettings.Development.json kullanir)..." -ForegroundColor Cyan
$env:DatabaseProvider = "SqlServer"
dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
$env:DatabaseProvider = $null

Write-Host "Tamamlandi." -ForegroundColor Green
