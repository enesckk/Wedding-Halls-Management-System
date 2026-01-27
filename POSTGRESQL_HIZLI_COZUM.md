# PostgreSQL Bağlantı Hatası - Hızlı Çözüm

## 🔴 Hata
```
Failed to connect to 127.0.0.1:5432
Hedef makine etkin olarak reddettiğinden bağlantı kurulamadı
```

## ✅ Çözüm Adımları

### 1. PostgreSQL Servisini Kontrol Edin

**Yöntem 1: Windows Services (Önerilen)**
1. `Win + R` tuşlarına basın
2. `services.msc` yazın ve Enter'a basın
3. "PostgreSQL" veya "postgres" arayın
4. Servis durumunu kontrol edin:
   - **Çalışıyorsa (Running)**: Başka bir sorun var, aşağıdaki adımlara bakın
   - **Durdurulmuş (Stopped)**: Sağ tıklayın → **Start** seçeneğini tıklayın

**Yöntem 2: PowerShell (Yönetici olarak)**
```powershell
# Servisleri listele
Get-Service | Where-Object { $_.DisplayName -like "*postgres*" }

# Servisi başlat (servis adını bulduktan sonra)
Start-Service -Name "postgresql-x64-15"  # Servis adınızı kullanın
```

### 2. PostgreSQL Yüklü Değilse

1. **İndirin:**
   - https://www.postgresql.org/download/windows/
   - "Download the installer" butonuna tıklayın
   - Windows x86-64 sürümünü indirin

2. **Kurulum:**
   - İndirilen `.exe` dosyasını çalıştırın
   - Kurulum sırasında:
     - **Port:** `5432` (varsayılan - değiştirmeyin)
     - **Superuser Password:** Güçlü bir şifre belirleyin (unutmayın!)
     - **Locale:** Turkish, Turkey veya English, United States

3. **Kurulum Sonrası:**
   - PostgreSQL servisi otomatik başlamalı
   - `services.msc` ile kontrol edin

### 3. Connection String'i Kontrol Edin

Backend klasöründe `appsettings.Development.json` dosyasını açın:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
  }
}
```

**Önemli:**
- `Password=` kısmına PostgreSQL kullanıcısının şifresini yazın
- Eğer şifre yoksa, PostgreSQL'de kullanıcı oluşturmanız gerekebilir

### 4. PostgreSQL Kullanıcısı ve Veritabanı Oluşturma

PostgreSQL yüklüyse ama `enescikcik` kullanıcısı yoksa:

1. **psql ile bağlanın:**
   ```powershell
   # PostgreSQL bin klasörüne gidin (versiyon numaranızı kontrol edin)
   cd "C:\Program Files\PostgreSQL\15\bin"
   
   # postgres kullanıcısı ile bağlanın
   .\psql.exe -U postgres
   ```

2. **psql içinde komutları çalıştırın:**
   ```sql
   -- Kullanıcı oluştur (şifreyi değiştirin)
   CREATE USER enescikcik WITH PASSWORD 'your_password';
   
   -- Veritabanı oluştur
   CREATE DATABASE nikahsalon OWNER enescikcik;
   
   -- İzinleri ver
   GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
   
   -- Çıkış
   \q
   ```

### 5. Bağlantıyı Test Edin

PostgreSQL çalışıyorsa, bağlantıyı test edin:

```powershell
cd "C:\Program Files\PostgreSQL\15\bin"
.\psql.exe -U enescikcik -d nikahsalon -h localhost -p 5432
```

Bağlantı başarılıysa, backend'i tekrar çalıştırın:
```powershell
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API
dotnet run
```

## 🚀 Hızlı Başlatma Scripti

PowerShell'i **Yönetici olarak** açın ve şu komutu çalıştırın:

```powershell
# PostgreSQL servisini bul ve başlat
$service = Get-Service | Where-Object { $_.DisplayName -like "*postgres*" } | Select-Object -First 1
if ($service) {
    if ($service.Status -ne 'Running') {
        Start-Service -Name $service.Name
        Write-Host "PostgreSQL servisi baslatildi!" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL servisi zaten calisiyor." -ForegroundColor Green
    }
} else {
    Write-Host "PostgreSQL servisi bulunamadi. Lutfen PostgreSQL'i yukleyin." -ForegroundColor Red
}
```

VEYA hazır scripti kullanın:
```powershell
.\start-postgresql.ps1
```

## 📋 Kontrol Listesi

- [ ] PostgreSQL yüklü mü? (`C:\Program Files\PostgreSQL` klasörü var mı?)
- [ ] PostgreSQL servisi çalışıyor mu? (`services.msc` ile kontrol)
- [ ] Connection string'de şifre doğru mu?
- [ ] `enescikcik` kullanıcısı PostgreSQL'de var mı?
- [ ] `nikahsalon` veritabanı var mı?
- [ ] Port 5432 kullanılabilir mi? (`netstat -ano | findstr :5432`)

## 🆘 Hala Çalışmıyorsa

1. **Windows Firewall kontrolü:**
   - Windows Defender Firewall'u kontrol edin
   - PostgreSQL için port 5432'yi açın

2. **PostgreSQL log dosyalarına bakın:**
   - `C:\Program Files\PostgreSQL\15\data\log\` klasörüne bakın
   - Hata mesajlarını kontrol edin

3. **PostgreSQL'i yeniden başlatın:**
   ```powershell
   # Servisi durdur
   Stop-Service -Name "postgresql-x64-15"
   # Servisi başlat
   Start-Service -Name "postgresql-x64-15"
   ```

4. **Detaylı log için:**
   - `BACKEND_REHBERI.md` dosyasındaki "Veritabanı bağlantı hatası" bölümüne bakın

---

## 🐳 Docker ile PostgreSQL (Önerilen - Ubuntu ile Aynı)

Windows'ta PostgreSQL kurulum sorunları yaşıyorsanız, Docker kullanmak daha kolay ve güvenilirdir:

### Hızlı Başlangıç

1. **Docker Desktop'ı başlatın** (sistem tepsisinde Docker ikonu görünmeli)

2. **PowerShell scriptini çalıştırın:**
   ```powershell
   .\start-postgres-docker.ps1
   ```

3. **Veya manuel olarak:**
   ```powershell
   docker run --name postgres-nikahsalon `
     -e POSTGRES_USER=enescikcik `
     -e POSTGRES_PASSWORD=your_password `
     -e POSTGRES_DB=nikahsalon `
     -p 5432:5432 `
     -v postgres-data:/var/lib/postgresql/data `
     -d postgres:15
   ```

4. **Backend'i çalıştırın** - Connection string aynı kalır!

**Detaylı rehber için:** `DOCKER_POSTGRESQL.md` dosyasına bakın.

**Avantajlar:**
- ✅ Windows kurulum sorunları yok
- ✅ Ubuntu ile aynı ortam
- ✅ Kolay yönetim (start/stop)
- ✅ Veriler volume ile kalıcı
- ✅ Kolay temizlik
