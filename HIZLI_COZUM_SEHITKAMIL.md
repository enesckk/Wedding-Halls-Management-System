# sehitkamil_db - Hızlı Çözüm

## 🔴 Sorun: "role postgres does not exist"

Container'da `postgres` kullanıcısı yok. Hangi kullanıcı ile oluşturulduğunu bulalım.

## ✅ Hızlı Çözüm (3 Adım)

### 1. Container'a Bash ile Bağlanın

```bash
docker exec -it sehitkamil_db bash
```

### 2. Container İçinde PostgreSQL'e Bağlanın

```bash
# Kullanıcı adı olmadan deneyin
psql

# VEYA environment variable'ı kontrol edin
env | grep POSTGRES
```

### 3. Yeni Kullanıcı ve Veritabanı Oluşturun

Eğer bağlandıysanız (psql içinde):

```sql
-- Mevcut kullanıcıyı görmek için
SELECT current_user;

-- Yeni kullanıcı oluştur
CREATE USER enescikcik WITH PASSWORD 'your_password';

-- Veritabanı oluştur
CREATE DATABASE nikahsalon OWNER enescikcik;

-- İzinleri ver
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;

-- Çıkış
\q
```

## 🔍 Alternatif: Container Bilgilerini Kontrol

```bash
# WSL Ubuntu'da
docker inspect sehitkamil_db | grep POSTGRES_USER
```

Bu komut size container'ın hangi kullanıcı ile oluşturulduğunu gösterecek.

**Örnek çıktı:**
```
"POSTGRES_USER=sehitkamil"
```

O zaman şu komutla bağlanın:

```bash
docker exec -it sehitkamil_db psql -U sehitkamil
```

## 🎯 Tek Komut Çözümü

Eğer container'da `sehitkamil` kullanıcısı varsa:

```bash
docker exec -it sehitkamil_db psql -U sehitkamil <<EOF
CREATE USER enescikcik WITH PASSWORD 'your_password';
CREATE DATABASE nikahsalon OWNER enescikcik;
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
\q
EOF
```

---

**Önce container'a bash ile bağlanıp kullanıcıyı bulun, sonra yeni kullanıcı oluşturun!**
