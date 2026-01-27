# WSL PostgreSQL - Hızlı Başlangıç

## ✅ Doğru Komut

```bash
# Dikkat: exec (exex değil!)
docker exec -it sehitkamil_db psql -U postgres
```

## 🚀 Adım Adım

### 1. WSL Ubuntu'ya gidin

```powershell
# Windows PowerShell'den
wsl -d Ubuntu
```

### 2. Container'ın çalıştığını kontrol edin

```bash
docker ps | grep postgres
```

### 3. PostgreSQL'e bağlanın

```bash
# Doğru komut (exec, exex değil!)
docker exec -it sehitkamil_db psql -U postgres
```

### 4. SQL komutlarını çalıştırın

psql içinde:

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

## 🐛 Yaygın Hatalar

### Hata 1: "unknown shorthand flag: 'i' in -it"

**Neden:** `docker exex` yazılmış (exec değil)

**Çözüm:**
```bash
# Yanlış
docker exex -it sehitkamil_db psql -U postgres

# Doğru
docker exec -it sehitkamil_db psql -U postgres
```

### Hata 2: "container not found"

**Neden:** Container adı yanlış veya container çalışmıyor

**Çözüm:**
```bash
# Container'ları listele
docker ps

# Container adını kontrol et
docker ps --format "{{.Names}}"
```

### Hata 3: "permission denied"

**Neden:** Kullanıcı izinleri yok

**Çözüm:**
```bash
# postgres kullanıcısı ile bağlan
docker exec -it sehitkamil_db psql -U postgres
```

## 📋 Tam Komut Seti

```bash
# 1. WSL'e gidin
wsl -d Ubuntu

# 2. Container kontrolü
docker ps | grep sehitkamil_db

# 3. PostgreSQL'e bağlanın
docker exec -it sehitkamil_db psql -U postgres

# 4. SQL komutları (psql içinde)
CREATE USER enescikcik WITH PASSWORD 'your_password';
CREATE DATABASE nikahsalon OWNER enescikcik;
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
\q

# 5. Test bağlantısı
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon
```

## ✅ Başarı Kontrolü

Bağlantı başarılıysa şunu görmelisiniz:

```
psql (15.x)
Type "help" for help.

nikahsalon=#
```

## 🔧 Alternatif: Tek Satırda

Eğer interaktif mod istemiyorsanız:

```bash
docker exec sehitkamil_db psql -U postgres -c "CREATE USER enescikcik WITH PASSWORD 'your_password';"
docker exec sehitkamil_db psql -U postgres -c "CREATE DATABASE nikahsalon OWNER enescikcik;"
docker exec sehitkamil_db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;"
```

---

**Önemli:** `exec` yazın, `exex` değil! 😊
