# sehitkamil_db - admin Kullanıcısı ile Çözüm

## ✅ Bulunan Bilgiler

Container'da:
- **Kullanıcı:** `admin`
- **Şifre:** `secret`
- **Veritabanı:** `superapp`

## 🚀 Hızlı Çözüm

### Container İçindeyken (root@c0abe407f565)

Eğer hala container içindeyseniz:

```bash
# PostgreSQL'e admin kullanıcısı ile bağlanın
psql -U admin -d superapp

# VEYA sadece
psql -U admin
```

### Container Dışındayken (WSL Ubuntu)

```bash
# admin kullanıcısı ile bağlanın
docker exec -it sehitkamil_db psql -U admin -d superapp
```

## 📋 Yeni Kullanıcı ve Veritabanı Oluşturma

psql içinde (admin kullanıcısı ile bağlandıktan sonra):

```sql
-- Mevcut kullanıcıyı kontrol edin
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

## 🎯 Tek Komut Çözümü

WSL Ubuntu'da:

```bash
docker exec -it sehitkamil_db psql -U admin -d superapp <<EOF
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

Başarılı olursa:
```
psql (15.x)
Type "help" for help.

nikahsalon=>
```

## 📝 Backend Connection String

`appsettings.Development.json` dosyasında:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
  }
}
```

**Önemli:** `your_password` yerine oluşturduğunuz şifreyi yazın!

---

**Özet:** Container'da `admin` kullanıcısı var. Bu kullanıcı ile bağlanıp yeni kullanıcı ve veritabanı oluşturun.
