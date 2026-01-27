# Backend Çalıştırma Rehberi

Bu rehber, Wedding Hall Management System backend'ini ayrı bir klasörde nasıl çalıştıracağınızı açıklar.

## 📋 Ön Gereksinimler

- **.NET SDK** (7.0 veya üzeri) - [İndir](https://dotnet.microsoft.com/download)
- **PostgreSQL** veritabanı - [İndir](https://www.postgresql.org/download/)
- **Visual Studio** veya **Visual Studio Code** (opsiyonel)

---

## 🚀 Hızlı Başlangıç

### 1. Backend Projesini Bulun

Backend projesi genellikle şu konumlardan birinde olabilir:
- `../wedding-hall-api/` (üst klasörde)
- `../Wedding-Hall-API/` (üst klasörde)
- Ayrı bir repository'de

Backend projesinin `.csproj` dosyasına sahip bir ASP.NET Core projesi olduğundan emin olun.

### 2. Backend Klasörüne Gidin

Terminal/PowerShell'de:

```bash
# Örnek: Backend projesi üst klasördeyse
cd ../wedding-hall-api

# Veya tam yol ile
cd C:\Users\Dell\Documents\PROJECT\wedding-hall-api
```

### 3. Bağımlılıkları Yükleyin

```bash
dotnet restore
```

### 4. Veritabanı Bağlantısını Yapılandırın

`appsettings.json` veya `appsettings.Development.json` dosyasını açın ve PostgreSQL bağlantı bilgilerini güncelleyin:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=wedding_hall_db;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here-min-32-characters",
    "Issuer": "wedding-hall-api",
    "Audience": "wedding-hall-ui",
    "ExpirationHours": 1
  }
}
```

### 5. Veritabanını Oluşturun

Backend projesi ilk çalıştırmada veritabanını otomatik oluşturur (`EnsureCreatedAsync`). Alternatif olarak:

```bash
# Migration kullanılıyorsa
dotnet ef database update
```

### 6. Backend'i Çalıştırın

**Development modunda:**

```bash
dotnet run
```

Veya belirli bir port ile:

```bash
dotnet run --urls "http://localhost:5230"
```

**Production modunda:**

```bash
dotnet run --configuration Release
```

Backend başarıyla çalıştığında şu mesajı görmelisiniz:
```
Now listening on: http://localhost:5230
```

---

## 🔧 Geliştirme Ortamı Kurulumu

### Visual Studio Code ile

1. Backend klasörünü VS Code'da açın
2. Terminal'de `dotnet restore` çalıştırın
3. `launch.json` dosyası oluşturun (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (web)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/bin/Debug/net7.0/wedding-hall-api.dll",
      "args": [],
      "cwd": "${workspaceFolder}",
      "stopAtEntry": false,
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
      },
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "sourceFileMap": {
        "/Views": "${workspaceFolder}/Views"
      }
    }
  ]
}
```

4. F5 ile çalıştırın

### Visual Studio ile

1. Backend `.sln` dosyasını açın
2. Projeyi "Startup Project" olarak ayarlayın
3. F5 ile çalıştırın

---

## 🌐 Port ve URL Yapılandırması

Backend varsayılan olarak **port 5230**'da çalışır. Değiştirmek için:

### `appsettings.json` ile:

```json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:5230"
      }
    }
  }
}
```

### Environment Variable ile:

```bash
# Windows PowerShell
$env:ASPNETCORE_URLS="http://localhost:5230"
dotnet run

# Linux/Mac
export ASPNETCORE_URLS="http://localhost:5230"
dotnet run
```

### `launchSettings.json` ile:

`Properties/launchSettings.json` dosyasında:

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "launchBrowser": true,
      "applicationUrl": "http://localhost:5230",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

---

## 🔗 Frontend ile Bağlantı

Frontend'in backend'e bağlanabilmesi için:

### 1. Frontend Environment Variable'ı Ayarlayın

Frontend projesinde `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:5230
```

### 2. CORS Ayarlarını Kontrol Edin

Backend'de `Program.cs` veya `Startup.cs` dosyasında CORS ayarlarının olduğundan emin olun:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ...

app.UseCors("AllowFrontend");
```

---

## 📝 Test Kullanıcıları

Backend seed verileri ile birlikte gelir. Test kullanıcıları:

| Email | Şifre | Rol |
|-------|-------|-----|
| `viewer@nikahsalon.local` | `Viewer1!` | Viewer |
| `editor@nikahsalon.local` | `Editor1!` | Editor |

---

## 🐛 Sorun Giderme

### "dotnet" komutu tanınmıyor

Bu hata, .NET SDK'nın yüklü olmadığı veya PATH'e eklenmediği anlamına gelir.

**Çözüm:**

1. **.NET SDK'yı İndirin ve Yükleyin:**
   - [.NET SDK İndirme Sayfası](https://dotnet.microsoft.com/download)
   - **.NET 7.0 SDK** veya **.NET 8.0 SDK** (LTS) indirin
   - İndirilen `.exe` dosyasını çalıştırın ve kurulumu tamamlayın

2. **Yükleme Sonrası:**
   - PowerShell/CMD penceresini **kapatın ve yeniden açın**
   - Veya bilgisayarı yeniden başlatın (önerilen)

3. **Kontrol Edin:**
   ```powershell
   dotnet --version
   ```
   
   Versiyon numarası görünmelidir (örn: `7.0.100` veya `8.0.100`)

4. **Hala Çalışmıyorsa:**
   
   .NET SDK yüklü ama PATH'e eklenmemiş olabilir. Manuel olarak ekleyin:
   
   - Windows'ta: `C:\Program Files\dotnet` klasörünü PATH'e ekleyin
   - Sistem Özellikleri → Gelişmiş → Ortam Değişkenleri → Path → Yeni → `C:\Program Files\dotnet` ekleyin

### Backend başlamıyor

1. **Port kullanımda mı kontrol edin:**
   ```bash
   # Windows
   netstat -ano | findstr :5230
   
   # Linux/Mac
   lsof -i :5230
   ```

2. **PostgreSQL çalışıyor mu kontrol edin:**
   ```bash
   # Windows (Services)
   services.msc
   
   # Linux
   sudo systemctl status postgresql
   ```

3. **Bağlantı string'i doğru mu kontrol edin:**
   - `appsettings.json` dosyasındaki connection string'i kontrol edin
   - PostgreSQL kullanıcı adı ve şifresini doğrulayın

### Veritabanı bağlantı hatası

**Hata:** `Failed to connect to 127.0.0.1:5432` veya `Hedef makine etkin olarak reddettiğinden bağlantı kurulamadı`

Bu hata, PostgreSQL servisinin çalışmadığını veya erişilemediğini gösterir.

#### 1. PostgreSQL Servisini Kontrol Edin

**PowerShell ile:**
```powershell
# PostgreSQL servisini bulun
Get-Service | Where-Object { $_.DisplayName -like "*postgres*" }

# Servis adını bulduktan sonra durumunu kontrol edin
Get-Service -Name "postgresql-x64-*"  # veya bulduğunuz servis adı
```

**Windows Services ile:**
```powershell
# Services penceresini açın
services.msc
```
Services penceresinde "postgresql" veya "PostgreSQL" arayın ve durumunu kontrol edin.

#### 2. PostgreSQL Servisini Başlatın

**PowerShell ile (Yönetici olarak çalıştırın):**
```powershell
# Servis adını bulun (örnek: postgresql-x64-15)
$serviceName = Get-Service | Where-Object { $_.DisplayName -like "*postgres*" } | Select-Object -First 1 -ExpandProperty Name

# Servisi başlatın
Start-Service -Name $serviceName

# Durumunu kontrol edin
Get-Service -Name $serviceName
```

**Alternatif - Manuel Başlatma:**
1. `Win + R` tuşlarına basın
2. `services.msc` yazın ve Enter'a basın
3. "PostgreSQL" servisini bulun
4. Sağ tıklayın → "Start" seçeneğini tıklayın

#### 3. PostgreSQL Yüklü Değilse

PostgreSQL yüklü değilse:

1. **PostgreSQL İndirin:**
   - [PostgreSQL İndirme Sayfası](https://www.postgresql.org/download/windows/)
   - Windows x86-64 installer'ı indirin

2. **Kurulum:**
   - İndirilen `.exe` dosyasını çalıştırın
   - Kurulum sırasında:
     - Port: `5432` (varsayılan)
     - Superuser (postgres) şifresini belirleyin
     - Locale: `Turkish, Turkey` veya `English, United States`

3. **Kurulum Sonrası:**
   - PostgreSQL servisi otomatik başlamalı
   - Servisi kontrol edin: `services.msc`

#### 4. Connection String'i Kontrol Edin

`appsettings.json` veya `appsettings.Development.json` dosyasında:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
  }
}
```

**Önemli:**
- `Password=` boş bırakılmamalı (şifre varsa)
- `Username` PostgreSQL'de mevcut bir kullanıcı olmalı
- `Database` oluşturulmuş olmalı (veya `EnsureCreatedAsync` ile otomatik oluşturulacak)

#### 5. PostgreSQL Kullanıcısı ve Veritabanı Oluşturma

PostgreSQL yüklüyse ama kullanıcı/veritabanı yoksa:

```powershell
# PostgreSQL bin klasörüne gidin (örnek yol)
cd "C:\Program Files\PostgreSQL\15\bin"

# psql ile bağlanın (postgres kullanıcısı ile)
.\psql.exe -U postgres

# psql içinde:
# Kullanıcı oluştur
CREATE USER enescikcik WITH PASSWORD 'your_password';

# Veritabanı oluştur
CREATE DATABASE nikahsalon OWNER enescikcik;

# İzinleri ver
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;

# Çıkış
\q
```

#### 6. Port Kontrolü

PostgreSQL farklı bir portta çalışıyorsa:

```powershell
# Hangi portlar dinleniyor kontrol edin
netstat -ano | findstr :5432
```

Eğer port 5432 kullanılamıyorsa, `appsettings.json`'da portu değiştirin veya PostgreSQL'i farklı bir portta başlatın.

#### 7. Hızlı Test

PostgreSQL çalışıyorsa, bağlantıyı test edin:

```powershell
# PostgreSQL bin klasörüne gidin
cd "C:\Program Files\PostgreSQL\15\bin"

# Bağlantıyı test edin
.\psql.exe -U enescikcik -d nikahsalon -h localhost -p 5432
```

Bağlantı başarılıysa, backend'i tekrar çalıştırın.

### CORS hatası

1. Backend'de CORS ayarlarını kontrol edin
2. Frontend URL'inin CORS policy'de tanımlı olduğundan emin olun
3. `AllowCredentials()` kullanıyorsanız `WithOrigins()` kullanın (wildcard `*` ile çalışmaz)

### JWT token hatası

1. `appsettings.json`'da JWT SecretKey'in en az 32 karakter olduğundan emin olun
2. Frontend'in token'ı `Authorization: Bearer <token>` header'ı ile gönderdiğinden emin olun

---

## 📦 Production Deployment

### 1. Build

```bash
dotnet build --configuration Release
```

### 2. Publish

```bash
dotnet publish -c Release -o ./publish
```

### 3. Çalıştırma

```bash
cd publish
dotnet wedding-hall-api.dll
```

### IIS Deployment

1. IIS'de yeni bir site oluşturun
2. Publish klasörünü site root'una kopyalayın
3. Application Pool'u "No Managed Code" olarak ayarlayın
4. `web.config` dosyasını kontrol edin

---

## 🔄 İki Projeyi Birlikte Çalıştırma

### Terminal 1 - Backend:

```bash
cd C:\Users\Dell\Documents\PROJECT\wedding-hall-api
dotnet run
```

### Terminal 2 - Frontend:

```bash
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System
npm run dev
```

### Otomatik Script (PowerShell):

`start-both.ps1` dosyası oluşturun:

```powershell
# Backend'i arka planda başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Dell\Documents\PROJECT\wedding-hall-api'; dotnet run"

# Biraz bekle
Start-Sleep -Seconds 3

# Frontend'i başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System'; npm run dev"
```

Çalıştırmak için:
```bash
.\start-both.ps1
```

---

## 📚 Ek Kaynaklar

- [ASP.NET Core Dokümantasyonu](https://docs.microsoft.com/aspnet/core)
- [PostgreSQL Dokümantasyonu](https://www.postgresql.org/docs/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)

---

## ✅ Kontrol Listesi

Backend'i çalıştırmadan önce:

- [ ] .NET SDK yüklü
- [ ] PostgreSQL yüklü ve çalışıyor
- [ ] `appsettings.json` yapılandırıldı
- [ ] Connection string doğru
- [ ] Port 5230 boş
- [ ] CORS ayarları yapıldı
- [ ] Frontend `.env.local` dosyası oluşturuldu

Backend çalıştıktan sonra:

- [ ] `http://localhost:5230` erişilebilir
- [ ] Test kullanıcı ile login yapılabiliyor
- [ ] Frontend backend'e bağlanabiliyor
- [ ] API endpoint'leri çalışıyor

---

**Sorun yaşarsanız:** Backend projesinin `README.md` dosyasını kontrol edin veya log dosyalarına bakın.
