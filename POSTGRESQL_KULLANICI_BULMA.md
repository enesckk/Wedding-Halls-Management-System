# PostgreSQL Kullanıcı Bulma ve Bağlanma

## 🔴 Hata: "role postgres does not exist"

Bu hata, container'da `postgres` kullanıcısının olmadığını gösterir. Container'da hangi kullanıcıların olduğunu bulmamız gerekir.

## 🔍 Çözüm: Kullanıcıları Bulma

### Yöntem 1: Container Environment Variables'ı Kontrol Etme

```bash
# Container'ın environment variable'larını kontrol edin
docker inspect sehitkamil_db | grep -i postgres_user
```

Veya daha detaylı:

```bash
# Container bilgilerini görüntüle
docker inspect sehitkamil_db
```

`POSTGRES_USER` veya `POSTGRES_DB` değerlerini arayın.

### Yöntem 2: Varsayılan Kullanıcı ile Bağlanma

PostgreSQL container'larında genellikle varsayılan kullanıcı `postgres` değil, container'ın oluşturulurken belirlenen kullanıcıdır.

**Deneyin:**

```bash
# Container adından kullanıcı adını tahmin edin
# sehitkamil_db -> belki "sehitkamil" veya başka bir kullanıcı

# Önce container'a shell ile bağlanın
docker exec -it sehitkamil_db bash

# PostgreSQL'e bağlanmayı deneyin (kullanıcı adı olmadan)
psql

# Veya farklı kullanıcı adları deneyin
psql -U sehitkamil
psql -U admin
psql -U root
```

### Yöntem 3: Container Loglarını Kontrol Etme

```bash
# Container loglarını kontrol edin
docker logs sehitkamil_db | grep -i user
docker logs sehitkamil_db | grep -i postgres
```

### Yöntem 4: Docker Compose veya Run Komutunu Kontrol Etme

Eğer container'ı siz oluşturduysanız, hangi kullanıcı ile oluşturduğunuzu hatırlayın.

## ✅ Alternatif Çözümler

### Çözüm 1: Yeni Kullanıcı Oluşturma (Superuser ile)

Eğer container'da başka bir superuser varsa:

```bash
# Önce mevcut kullanıcıları bulun
docker exec -it sehitkamil_db bash
psql -U $(whoami)  # Veya farklı kullanıcı adları deneyin

# Bağlandıktan sonra:
CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres_password';
```

### Çözüm 2: Container'ı Yeniden Oluşturma

Eğer kullanıcıları bulamıyorsanız, yeni bir container oluşturun:

```bash
# Mevcut container'ı durdurun (veriler kaybolmaz volume kullanıyorsanız)
docker stop sehitkamil_db

# Yeni container oluşturun (postgres kullanıcısı ile)
docker run --name sehitkamil_db_new \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres_password \
  -e POSTGRES_DB=sehitkamil \
  -p 5432:5432 \
  -v sehitkamil_data:/var/lib/postgresql/data \
  -d postgres:15
```

### Çözüm 3: Mevcut Container'da Kullanıcı Bulma

```bash
# Container'a bash ile bağlanın
docker exec -it sehitkamil_db bash

# PostgreSQL data directory'yi kontrol edin
ls -la /var/lib/postgresql/data/

# pg_hba.conf dosyasını kontrol edin
cat /var/lib/postgresql/data/pg_hba.conf

# Veya environment variable'ları kontrol edin
env | grep POSTGRES
```

## 🎯 Hızlı Çözüm

En hızlı yol: Container'a bash ile bağlanıp kullanıcıları kontrol edin:

```bash
# 1. Container'a bash ile bağlan
docker exec -it sehitkamil_db bash

# 2. PostgreSQL'e bağlanmayı deneyin (kullanıcı adı olmadan)
psql

# 3. Eğer çalışırsa, mevcut kullanıcıyı görebilirsiniz
SELECT current_user;

# 4. Tüm kullanıcıları listeleyin
\du

# 5. Yeni kullanıcı oluşturun
CREATE USER enescikcik WITH PASSWORD 'your_password';
CREATE DATABASE nikahsalon OWNER enescikcik;
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
```

## 📋 Adım Adım

1. **Container'a bash ile bağlanın:**
   ```bash
   docker exec -it sehitkamil_db bash
   ```

2. **PostgreSQL'e bağlanmayı deneyin:**
   ```bash
   psql
   # Veya
   psql -U $(whoami)
   ```

3. **Mevcut kullanıcıları kontrol edin:**
   ```sql
   \du
   SELECT usename FROM pg_user;
   ```

4. **Yeni kullanıcı ve veritabanı oluşturun:**
   ```sql
   CREATE USER enescikcik WITH PASSWORD 'your_password';
   CREATE DATABASE nikahsalon OWNER enescikcik;
   GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
   ```

## 🔧 Alternatif: Container Bilgilerini Kontrol

```bash
# Container'ın nasıl oluşturulduğunu görmek için
docker inspect sehitkamil_db | grep -A 20 "Env"

# Veya docker-compose dosyasını kontrol edin (varsa)
cat docker-compose.yml | grep POSTGRES
```

---

**Önemli:** Container'da hangi kullanıcının olduğunu bulduktan sonra, o kullanıcı ile bağlanın veya yeni bir superuser oluşturun.
