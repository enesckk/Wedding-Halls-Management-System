# sehitkamil_db Container - Kullanıcı Bulma ve Bağlanma

## 🔴 Hata: "role postgres does not exist"

`sehitkamil_db` container'ında `postgres` kullanıcısı yok. Container'ın hangi kullanıcı ile oluşturulduğunu bulmamız gerekiyor.

## 🔍 Hızlı Çözüm

### Adım 1: Container Environment Variables'ı Kontrol Edin

```bash
# Container'ın environment variable'larını kontrol edin
docker inspect sehitkamil_db | grep -i POSTGRES_USER
```

Veya daha detaylı:

```bash
# Tüm environment variable'ları görüntüle
docker inspect sehitkamil_db | grep -A 30 "Env"
```

### Adım 2: Container'a Bash ile Bağlanın

```bash
# Container'a bash shell ile bağlanın
docker exec -it sehitkamil_db bash
```

### Adım 3: PostgreSQL'e Bağlanmayı Deneyin

Container içinde:

```bash
# Kullanıcı adı olmadan deneyin (varsayılan kullanıcı)
psql

# Veya environment variable'ı kontrol edin
env | grep POSTGRES

# Veya farklı kullanıcı adları deneyin
psql -U sehitkamil
psql -U admin
psql -U root
```

### Adım 4: Mevcut Kullanıcıları Listeleyin

Eğer bağlanabildiyseniz:

```sql
-- Tüm kullanıcıları listele
\du

-- Veya SQL ile
SELECT usename FROM pg_user;
```

## ✅ Alternatif Çözümler

### Çözüm 1: Container Bilgilerini Kontrol Etme

```bash
# Container'ın nasıl oluşturulduğunu görmek için
docker inspect sehitkamil_db | grep -A 20 "Env"

# POSTGRES_USER değerini bulun
docker inspect sehitkamil_db | grep POSTGRES_USER
```

### Çözüm 2: Container Loglarını Kontrol Etme

```bash
# Container loglarını kontrol edin
docker logs sehitkamil_db | grep -i user
docker logs sehitkamil_db | head -20
```

### Çözüm 3: Mevcut Kullanıcı ile Bağlanma

Eğer container'da başka bir kullanıcı varsa (örneğin `sehitkamil`):

```bash
# O kullanıcı ile bağlanın
docker exec -it sehitkamil_db psql -U sehitkamil

# Veya database belirtmeden
docker exec -it sehitkamil_db psql -U sehitkamil -d postgres
```

### Çözüm 4: Yeni Superuser Oluşturma

Eğer mevcut bir kullanıcı ile bağlanabildiyseniz:

```sql
-- Yeni superuser oluştur
CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres_password';

-- Veya direkt enescikcik kullanıcısını oluştur
CREATE USER enescikcik WITH SUPERUSER PASSWORD 'your_password';
CREATE DATABASE nikahsalon OWNER enescikcik;
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
```

## 🎯 En Hızlı Yol

```bash
# 1. Container'a bash ile bağlan
docker exec -it sehitkamil_db bash

# 2. Container içinde environment variable'ları kontrol et
env | grep POSTGRES

# 3. PostgreSQL'e bağlanmayı dene (kullanıcı adı olmadan)
psql

# 4. Eğer bağlandıysan, kullanıcıları listele
\du

# 5. Yeni kullanıcı ve veritabanı oluştur
CREATE USER enescikcik WITH PASSWORD 'your_password';
CREATE DATABASE nikahsalon OWNER enescikcik;
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
\q

# 6. Container'dan çık
exit
```

## 📋 Adım Adım Detaylı

### 1. Container Bilgilerini Kontrol Edin

```bash
# WSL Ubuntu'da
docker inspect sehitkamil_db | grep POSTGRES_USER
```

**Beklenen çıktı:**
```
"POSTGRES_USER=sehitkamil"
```
veya
```
"POSTGRES_USER=postgres"
```

### 2. Bulunan Kullanıcı ile Bağlanın

Eğer `POSTGRES_USER=sehitkamil` ise:

```bash
docker exec -it sehitkamil_db psql -U sehitkamil
```

### 3. Yeni Kullanıcı ve Veritabanı Oluşturun

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

## 🔧 Tek Komutla Çözüm

Eğer container'da `sehitkamil` kullanıcısı varsa:

```bash
docker exec -it sehitkamil_db psql -U sehitkamil <<EOF
CREATE USER enescikcik WITH PASSWORD 'your_password';
CREATE DATABASE nikahsalon OWNER enescikcik;
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
\q
EOF
```

## ✅ Test

Bağlantıyı test edin:

```bash
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon
```

Başarılı olursa şunu görmelisiniz:
```
psql (15.x)
Type "help" for help.

nikahsalon=>
```

---

**Önemli:** Container'da hangi kullanıcının olduğunu bulduktan sonra, o kullanıcı ile bağlanın veya yeni bir kullanıcı oluşturun.
