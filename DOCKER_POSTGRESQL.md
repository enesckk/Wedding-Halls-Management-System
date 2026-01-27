# Docker ile PostgreSQL Kurulumu

Bu rehber, Windows'ta Docker kullanarak PostgreSQL kurulumunu ve backend bağlantısını açıklar.

## 📋 Ön Gereksinimler

- **Docker Desktop** yüklü olmalı
  - [Docker Desktop İndir](https://www.docker.com/products/docker-desktop/)
  - Windows için Docker Desktop'ı indirip kurun
  - Kurulum sonrası Docker Desktop'ı başlatın

## 🚀 Hızlı Başlangıç

### 1. Docker Desktop'ı Başlatın

Docker Desktop uygulamasını açın ve çalıştığından emin olun (sistem tepsisinde Docker ikonu görünmeli).

### 2. PostgreSQL Container'ını Çalıştırın

PowerShell veya Command Prompt'u açın ve şu komutu çalıştırın:

```powershell
docker run --name postgres-nikahsalon `
  -e POSTGRES_USER=enescikcik `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=nikahsalon `
  -p 5432:5432 `
  -d postgres:15
```

**Komut Açıklaması:**
- `--name postgres-nikahsalon`: Container adı
- `-e POSTGRES_USER=enescikcik`: PostgreSQL kullanıcı adı
- `-e POSTGRES_PASSWORD=your_password`: PostgreSQL şifresi (değiştirin!)
- `-e POSTGRES_DB=nikahsalon`: Veritabanı adı
- `-p 5432:5432`: Port mapping (host:container)
- `-d`: Arka planda çalıştır
- `postgres:15`: PostgreSQL 15 imajı

### 3. Container Durumunu Kontrol Edin

```powershell
# Çalışan container'ları listele
docker ps

# PostgreSQL container'ının loglarını görüntüle
docker logs postgres-nikahsalon
```

### 4. Backend Connection String'i Güncelleyin

`appsettings.Development.json` dosyasını açın ve connection string'i güncelleyin:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
  }
}
```

**Önemli:** `your_password` yerine Docker komutunda kullandığınız şifreyi yazın.

### 5. Backend'i Çalıştırın

```powershell
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API
dotnet run
```

## 🔧 Docker Komutları

### Container Yönetimi

```powershell
# Container'ı başlat
docker start postgres-nikahsalon

# Container'ı durdur
docker stop postgres-nikahsalon

# Container'ı yeniden başlat
docker restart postgres-nikahsalon

# Container'ı sil (dikkatli - veriler silinir!)
docker rm postgres-nikahsalon

# Container ve verileri birlikte sil
docker rm -v postgres-nikahsalon
```

### Veri Kalıcılığı (Volume)

Verilerin kalıcı olması için volume kullanın:

```powershell
# Volume ile container oluştur
docker run --name postgres-nikahsalon `
  -e POSTGRES_USER=enescikcik `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=nikahsalon `
  -p 5432:5432 `
  -v postgres-data:/var/lib/postgresql/data `
  -d postgres:15
```

Volume'ları yönetmek için:
```powershell
# Volume listesi
docker volume ls

# Volume'u sil
docker volume rm postgres-data
```

### psql ile Bağlantı

```powershell
# Container içinde psql çalıştır
docker exec -it postgres-nikahsalon psql -U enescikcik -d nikahsalon

# Veya host'tan bağlan (psql yüklüyse)
psql -h localhost -p 5432 -U enescikcik -d nikahsalon
```

## 📝 Docker Compose ile Kurulum (Önerilen)

Docker Compose kullanarak daha kolay yönetim:

### 1. `docker-compose.yml` Dosyası Oluşturun

Proje kök dizininde `docker-compose.yml` dosyası oluşturun:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: postgres-nikahsalon
    environment:
      POSTGRES_USER: enescikcik
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: nikahsalon
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U enescikcik"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
```

### 2. Docker Compose ile Çalıştırın

**Not:** Yeni Docker Desktop sürümlerinde `docker-compose` yerine `docker compose` (boşluksuz) kullanılır.

```powershell
# Container'ı başlat (Windows PowerShell)
docker compose up -d

# Container'ı durdur
docker compose down

# Container'ı durdur ve volume'ları sil
docker compose down -v

# Logları görüntüle
docker compose logs -f postgres
```

**Eski sürümler için:**
```powershell
# Eğer docker-compose komutu çalışmıyorsa, docker compose kullanın
docker compose up -d
```

## 🔄 Mevcut Container'ı Kaldırıp Yeniden Oluşturma

Eğer container'ı yeniden oluşturmak isterseniz:

```powershell
# Container'ı durdur ve sil
docker stop postgres-nikahsalon
docker rm postgres-nikahsalon

# Yeniden oluştur
docker run --name postgres-nikahsalon `
  -e POSTGRES_USER=enescikcik `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=nikahsalon `
  -p 5432:5432 `
  -v postgres-data:/var/lib/postgresql/data `
  -d postgres:15
```

## 🐛 Sorun Giderme

### Container Başlamıyor

```powershell
# Logları kontrol edin
docker logs postgres-nikahsalon

# Container durumunu kontrol edin
docker ps -a
```

### Port Zaten Kullanımda

Eğer port 5432 başka bir program tarafından kullanılıyorsa:

```powershell
# Farklı bir port kullanın (örn: 5433)
docker run --name postgres-nikahsalon `
  -e POSTGRES_USER=enescikcik `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=nikahsalon `
  -p 5433:5432 `
  -d postgres:15
```

Connection string'de de portu güncelleyin:
```json
"DefaultConnection": "Host=localhost;Port=5433;Database=nikahsalon;Username=enescikcik;Password=your_password"
```

### Bağlantı Hatası

1. **Docker Desktop çalışıyor mu?**
   - Sistem tepsisinde Docker ikonunu kontrol edin
   - Docker Desktop'ı açın

2. **Container çalışıyor mu?**
   ```powershell
   docker ps
   ```

3. **Connection string doğru mu?**
   - Şifrenin doğru olduğundan emin olun
   - Port numarasını kontrol edin

### Veriler Kayboldu

Volume kullanmadıysanız, container silindiğinde veriler kaybolur. Volume ile oluşturun:

```powershell
docker run --name postgres-nikahsalon `
  -v postgres-data:/var/lib/postgresql/data `
  # ... diğer parametreler
```

## 📋 Hızlı Başlatma Scripti

PowerShell scripti oluşturun (`start-postgres-docker.ps1`):

```powershell
# PostgreSQL Docker Container Başlatma Scripti

Write-Host "=== PostgreSQL Docker Container ===" -ForegroundColor Cyan

# Container var mı kontrol et
$containerExists = docker ps -a --filter "name=postgres-nikahsalon" --format "{{.Names}}"

if ($containerExists -eq "postgres-nikahsalon") {
    Write-Host "Container bulundu. Baslatiliyor..." -ForegroundColor Yellow
    docker start postgres-nikahsalon
    Write-Host "Container baslatildi!" -ForegroundColor Green
} else {
    Write-Host "Container bulunamadi. Olusturuluyor..." -ForegroundColor Yellow
    docker run --name postgres-nikahsalon `
      -e POSTGRES_USER=enescikcik `
      -e POSTGRES_PASSWORD=your_password `
      -e POSTGRES_DB=nikahsalon `
      -p 5432:5432 `
      -v postgres-data:/var/lib/postgresql/data `
      -d postgres:15
    Write-Host "Container olusturuldu ve baslatildi!" -ForegroundColor Green
}

# Durum kontrolü
Start-Sleep -Seconds 3
docker ps --filter "name=postgres-nikahsalon"

Write-Host "`nPostgreSQL hazir! Backend'i calistirabilirsiniz." -ForegroundColor Green
```

Kullanımı:
```powershell
.\start-postgres-docker.ps1
```

## ✅ Kontrol Listesi

- [ ] Docker Desktop yüklü ve çalışıyor
- [ ] PostgreSQL container çalışıyor (`docker ps`)
- [ ] Port 5432 erişilebilir
- [ ] Connection string doğru yapılandırıldı
- [ ] Backend başarıyla bağlanıyor

## 🎯 Avantajlar

- ✅ Windows'ta PostgreSQL kurulum sorunları yok
- ✅ Kolay yönetim (start/stop/restart)
- ✅ Veriler volume ile kalıcı
- ✅ Farklı projeler için farklı container'lar
- ✅ Kolay temizlik (container silme)
- ✅ Ubuntu ile aynı ortam

---

**Not:** Şifreyi güvenli tutun ve production'da environment variable kullanın!
