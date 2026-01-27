# WSL Ubuntu'da PostgreSQL Kullanımı

WSL Ubuntu'da zaten çalışan PostgreSQL container'larınız var. Bu rehber, mevcut container'ları kullanmayı veya yeni bir container oluşturmayı açıklar.

## 🔍 Mevcut Container'lar

WSL Ubuntu'da çalışan PostgreSQL container'larınız:

```bash
docker ps
```

**Mevcut container'lar:**
- `sehitkamil_db` - Port 5432 (PostgreSQL 15)
- `cloudguide_postgres` - Port 5433 (PostgreSQL 15-alpine)

## ✅ Seçenek 1: Mevcut Container'ı Kullanma

### Port 5432'deki Container'ı Kullanın

`sehitkamil_db` container'ı zaten port 5432'de çalışıyor. Bu container'ı kullanabilirsiniz:

1. **Container'a bağlanın:**
   ```bash
   docker exec -it sehitkamil_db psql -U postgres
   ```

2. **Kullanıcı ve veritabanı oluşturun:**
   ```sql
   -- Kullanıcı oluştur
   CREATE USER enescikcik WITH PASSWORD 'your_password';
   
   -- Veritabanı oluştur
   CREATE DATABASE nikahsalon OWNER enescikcik;
   
   -- İzinleri ver
   GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
   
   -- Çıkış
   \q
   ```

3. **Backend connection string'i güncelleyin:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
     }
   }
   ```

## ✅ Seçenek 2: Yeni Container Oluşturma

WSL Ubuntu'da yeni bir container oluşturmak için:

### Yöntem 1: Bash Script ile

```bash
# Script'i çalıştırılabilir yapın
chmod +x start-postgres-docker.sh

# Script'i çalıştırın
./start-postgres-docker.sh
```

### Yöntem 2: Manuel Docker Komutu

```bash
docker run --name postgres-nikahsalon \
  -e POSTGRES_USER=enescikcik \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=nikahsalon \
  -p 5434:5432 \
  -v postgres-nikahsalon-data:/var/lib/postgresql/data \
  -d postgres:15
```

**Not:** Port 5432 ve 5433 kullanımda olduğu için 5434 kullandık. Connection string'de portu güncelleyin.

### Yöntem 3: Docker Compose ile

WSL Ubuntu'da:

```bash
# Docker Compose ile çalıştır
docker compose up -d

# Veya eski sürüm için
docker-compose up -d
```

## 🔧 Windows'tan WSL Container'ına Bağlanma

Windows'tan WSL'deki PostgreSQL container'ına bağlanmak için:

1. **WSL IP adresini bulun:**
   ```powershell
   # PowerShell'de
   wsl hostname -I
   ```

2. **Connection string'i güncelleyin:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=172.x.x.x;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
     }
   }
   ```

   Veya `localhost` kullanabilirsiniz (WSL2 otomatik port forwarding yapar):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
     }
   }
   ```

## 🚀 Hızlı Başlangıç (Mevcut Container Kullanımı)

1. **WSL Ubuntu'ya gidin:**
   ```powershell
   wsl -d Ubuntu
   ```

2. **Container'ın çalıştığını kontrol edin:**
   ```bash
   docker ps | grep postgres
   ```

3. **Kullanıcı ve veritabanı oluşturun:**
   
   **Önemli:** `sehitkamil_db` container'ında `postgres` kullanıcısı yok, `admin` kullanıcısı var!
   
   ```bash
   # admin kullanıcısı ile bağlanın
   docker exec -it sehitkamil_db psql -U admin -d superapp
   ```
   
   ```sql
   -- Yeni kullanıcı oluştur
   CREATE USER enescikcik WITH PASSWORD 'your_password';
   
   -- Veritabanı oluştur
   CREATE DATABASE nikahsalon OWNER enescikcik;
   
   -- İzinleri ver
   GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
   
   -- Çıkış
   \q
   ```
   
   **Not:** Container'da `admin` kullanıcısı var (şifre: `secret`). Detaylar için `SEHITKAMIL_ADMIN_COZUM.md` dosyasına bakın.

4. **Backend'i çalıştırın (Windows'tan):**
   ```powershell
   cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API
   dotnet run
   ```

## 📋 Container Yönetimi

```bash
# Container'ı başlat
docker start sehitkamil_db

# Container'ı durdur
docker stop sehitkamil_db

# Container'ı yeniden başlat
docker restart sehitkamil_db

# Container loglarını görüntüle
docker logs sehitkamil_db

# Container içinde psql çalıştır
docker exec -it sehitkamil_db psql -U postgres
```

## 🐛 Sorun Giderme

### Port Çakışması

Eğer port 5432 kullanımda ise:

1. **Farklı bir port kullanın:**
   ```bash
   docker run --name postgres-nikahsalon \
     -p 5434:5432 \
     # ... diğer parametreler
   ```

2. **Connection string'de portu güncelleyin:**
   ```json
   "DefaultConnection": "Host=localhost;Port=5434;Database=nikahsalon;Username=enescikcik;Password=your_password"
   ```

### Bağlantı Hatası

1. **WSL'de container çalışıyor mu?**
   ```bash
   docker ps
   ```

2. **Port forwarding çalışıyor mu?**
   ```powershell
   # Windows PowerShell'de
   netstat -ano | findstr :5432
   ```

3. **WSL IP adresini kontrol edin:**
   ```bash
   # WSL'de
   hostname -I
   ```

## ✅ Önerilen Yaklaşım

**En kolay yol:** Mevcut `sehitkamil_db` container'ını kullanın:

1. Container'a bağlanın
2. `enescikcik` kullanıcısı ve `nikahsalon` veritabanını oluşturun
3. Backend connection string'i güncelleyin
4. Backend'i çalıştırın

Bu şekilde yeni container oluşturmanıza gerek kalmaz!

## 🔒 Veriler Karışır mı?

**Hayır, karışmaz!** PostgreSQL'de her veritabanı tamamen izole edilmiştir:

- ✅ `sehitkamil_db` veritabanı → Mevcut proje verileri
- ✅ `nikahsalon` veritabanı → Yeni proje verileri (izole)
- ✅ Veriler birbirine karışmaz
- ✅ Her veritabanı kendi namespace'ine sahip

**Detaylı bilgi için:** `POSTGRESQL_VERI_IZOLASYONU.md` dosyasına bakın.

---

**Not:** WSL'deki container'lar Windows'tan `localhost` ile erişilebilir (WSL2 port forwarding sayesinde).

## 🔌 VS Code/Cursor Extension ile Bağlanma

Extension'lar (SQLTools, PostgreSQL extension) ile bağlanmak için:

1. **Önce container'da veritabanı ve kullanıcıyı oluşturun** (yukarıdaki adımlar)
2. **Sonra extension ile bağlanın:**
   - Server Address: `localhost`
   - Port: `5432`
   - Database: `nikahsalon`
   - Username: `enescikcik`
   - Password: `your_password`

**Detaylı rehber için:** `VSCODE_EXTENSION_BAGLANTI.md` dosyasına bakın.

**Önemli:** Extension'lar sadece mevcut veritabanlarına bağlanır. Önce container'da oluşturmanız gerekir!
