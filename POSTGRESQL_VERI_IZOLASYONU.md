# PostgreSQL Veri İzolasyonu - Veriler Karışır mı?

## ✅ Kısa Cevap: Hayır, Karışmaz!

PostgreSQL'de her **veritabanı (database)** tamamen izole edilmiştir. Aynı PostgreSQL container'ında farklı veritabanları birbirine karışmaz.

## 🔒 Veri İzolasyonu Nasıl Çalışır?

### 1. Veritabanı Seviyesinde İzolasyon

PostgreSQL'de:
- Her veritabanı kendi namespace'ine sahiptir
- Tablolar, kullanıcılar ve izinler veritabanı içinde izole edilir
- Bir veritabanındaki tablolar, diğer veritabanlarından görülemez

**Örnek:**
```
PostgreSQL Container (sehitkamil_db)
├── sehitkamil_db (mevcut proje)
│   ├── users tablosu
│   ├── orders tablosu
│   └── ...
├── nikahsalon (yeni proje) ✅
│   ├── halls tablosu
│   ├── bookings tablosu
│   └── ...
└── baska_proje (başka proje) ✅
    └── ...
```

### 2. Kullanıcı Seviyesinde İzolasyon

Her kullanıcı sadece yetkili olduğu veritabanlarına erişebilir:

```sql
-- enescikcik kullanıcısı sadece nikahsalon veritabanına erişebilir
-- sehitkamil_db veritabanına erişemez
```

## 🎯 Senaryolar ve Çözümler

### Senaryo 1: Mevcut Container'ı Kullanma (Önerilen)

**Durum:** `sehitkamil_db` container'ında zaten `sehitkamil_db` veritabanı var.

**Çözüm:** Yeni bir veritabanı oluşturun:

```sql
-- Container'a bağlan
docker exec -it sehitkamil_db psql -U postgres

-- Yeni veritabanı oluştur (mevcut veriler etkilenmez)
CREATE DATABASE nikahsalon;

-- Yeni kullanıcı oluştur
CREATE USER enescikcik WITH PASSWORD 'your_password';

-- Kullanıcıya sadece yeni veritabanına erişim ver
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;

-- Çıkış
\q
```

**Sonuç:**
- ✅ `sehitkamil_db` veritabanı korunur
- ✅ `nikahsalon` veritabanı izole oluşturulur
- ✅ Veriler birbirine karışmaz

### Senaryo 2: Ayrı Container Kullanma

Eğer tamamen izole bir ortam istiyorsanız:

```bash
# Yeni container oluştur (farklı port)
docker run --name postgres-nikahsalon \
  -e POSTGRES_USER=enescikcik \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=nikahsalon \
  -p 5434:5432 \
  -d postgres:15
```

**Avantajlar:**
- ✅ Tamamen izole ortam
- ✅ Farklı PostgreSQL versiyonları kullanılabilir
- ✅ Container'lar birbirinden bağımsız

**Dezavantajlar:**
- ❌ Daha fazla kaynak kullanımı
- ❌ Port yönetimi gerekir

### Senaryo 3: Aynı Container, Farklı Schema'lar

Aynı veritabanı içinde farklı schema'lar kullanabilirsiniz:

```sql
-- nikahsalon veritabanı içinde
CREATE SCHEMA nikahsalon_schema;
CREATE SCHEMA test_schema;

-- Her schema izole
```

## 📊 Karşılaştırma Tablosu

| Yaklaşım | İzolasyon | Kaynak Kullanımı | Yönetim Kolaylığı |
|----------|-----------|-----------------|-------------------|
| **Aynı Container, Farklı DB** | ✅ Yüksek | ✅ Düşük | ✅ Kolay |
| **Farklı Container'lar** | ✅✅ Çok Yüksek | ❌ Yüksek | ⚠️ Orta |
| **Aynı DB, Farklı Schema** | ⚠️ Orta | ✅ Düşük | ⚠️ Orta |

## ✅ Önerilen Yaklaşım

**En iyi pratik:** Mevcut container'ı kullanın, yeni veritabanı oluşturun:

```bash
# WSL Ubuntu'da
docker exec -it sehitkamil_db psql -U postgres

# SQL komutları
CREATE DATABASE nikahsalon;
CREATE USER enescikcik WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
\q
```

**Neden?**
- ✅ Veriler tamamen izole
- ✅ Kaynak kullanımı düşük
- ✅ Yönetim kolay
- ✅ Mevcut container'ı kullanır

## 🔍 Veritabanlarını Listeleme

Mevcut veritabanlarını görmek için:

```sql
-- PostgreSQL'e bağlan
docker exec -it sehitkamil_db psql -U postgres

-- Veritabanlarını listele
\l

-- Veya
SELECT datname FROM pg_database;
```

**Örnek çıktı:**
```
   Name      | Owner  | Encoding | Collate | Ctype
-------------+--------+----------+---------+-------
 postgres    | postgres| UTF8     | ...     | ...
 sehitkamil_db| postgres| UTF8   | ...     | ...
 nikahsalon  | enescikcik| UTF8  | ...     | ...
```

## 🛡️ Güvenlik ve İzinler

Kullanıcı izinlerini doğru ayarlayarak izolasyonu garanti edin:

```sql
-- Kullanıcıya sadece kendi veritabanına erişim ver
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;

-- Diğer veritabanlarına erişim verme
-- (Varsayılan olarak erişemez)
```

## 🧪 Test: Veriler Karışıyor mu?

Test etmek için:

```sql
-- sehitkamil_db veritabanına bağlan
\c sehitkamil_db

-- Tabloları listele
\dt

-- nikahsalon veritabanına bağlan
\c nikahsalon

-- Tabloları listele (farklı olmalı)
\dt
```

**Sonuç:** Her veritabanında farklı tablolar görünür, karışmaz!

## 📋 Özet

1. ✅ **Veriler karışmaz** - Her veritabanı izole
2. ✅ **Aynı container kullanılabilir** - Kaynak tasarrufu
3. ✅ **Kullanıcı izinleri önemli** - Güvenlik için
4. ✅ **En iyi pratik:** Mevcut container + yeni veritabanı

## 🚀 Hızlı Başlangıç

Mevcut container'ı kullanarak yeni veritabanı oluşturun:

```bash
# WSL Ubuntu'da
docker exec -it sehitkamil_db psql -U postgres <<EOF
CREATE DATABASE nikahsalon;
CREATE USER enescikcik WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
\q
EOF
```

Backend connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
  }
}
```

**Sonuç:** Veriler tamamen izole, karışmaz! 🎉

---

**Not:** Eğer yine de endişeleniyorsanız, yeni bir container oluşturabilirsiniz, ancak gerekli değil.
