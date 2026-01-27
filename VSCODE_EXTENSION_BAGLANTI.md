# VS Code/Cursor Extension ile PostgreSQL Bağlantısı

## 📋 Önce Ne Yapmalı?

**Kısa cevap:** Önce container'da veritabanı ve kullanıcıyı oluşturun, sonra extension ile bağlanın.

## 🔄 İki Yöntem

### Yöntem 1: Önce Container'da Oluştur (Önerilen) ✅

**Adımlar:**

1. **WSL'de veritabanı ve kullanıcıyı oluşturun:**
   ```bash
   # WSL Ubuntu'ya gidin
   wsl -d Ubuntu
   
   # PostgreSQL'e bağlanın
   docker exec -it sehitkamil_db psql -U postgres
   
   # SQL komutları
   CREATE USER enescikcik WITH PASSWORD 'your_password';
   CREATE DATABASE nikahsalon OWNER enescikcik;
   GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
   \q
   ```

2. **Extension ile bağlanın:**
   - VS Code/Cursor'da SQLTools veya PostgreSQL extension'ını açın
   - "Add New Connection" butonuna tıklayın
   - Bağlantı bilgilerini girin:
     - **Server Address:** `localhost`
     - **Port:** `5432`
     - **Database:** `nikahsalon`
     - **Username:** `enescikcik`
     - **Password:** `your_password`

**Avantajlar:**
- ✅ Daha güvenli ve kontrollü
- ✅ İzinler doğru ayarlanır
- ✅ Extension sadece bağlanır, oluşturmaz

### Yöntem 2: Extension Üzerinden Oluştur (Mümkünse)

Bazı extension'lar veritabanı oluşturabilir, ancak:

**Sınırlamalar:**
- ❌ Container'ı oluşturamaz
- ❌ Kullanıcı oluşturma sınırlı olabilir
- ❌ İzinler otomatik ayarlanmayabilir

**Eğer extension veritabanı oluşturabiliyorsa:**
1. Önce `postgres` kullanıcısı ile bağlanın
2. Extension üzerinden veritabanı oluşturun
3. Sonra yeni kullanıcı oluşturun

## 🎯 Önerilen Yaklaşım

**En iyi pratik:** Önce container'da oluşturun, sonra extension ile bağlanın.

### Adım Adım

#### 1. Container'da Veritabanı ve Kullanıcı Oluşturma

```bash
# WSL Ubuntu'ya gidin
wsl -d Ubuntu

# Container'ın çalıştığını kontrol edin
docker ps | grep sehitkamil_db

# PostgreSQL'e bağlanın
docker exec -it sehitkamil_db psql -U postgres

# SQL komutları (psql içinde)
CREATE USER enescikcik WITH PASSWORD 'your_password';
CREATE DATABASE nikahsalon OWNER enescikcik;
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
\q
```

#### 2. VS Code/Cursor Extension ile Bağlanma

**SQLTools Extension için:**

1. **Extension'ı açın:**
   - Sol sidebar'da "SQLTools" panelini açın
   - "Add New Connection" butonuna tıklayın

2. **Bağlantı bilgilerini girin:**
   ```
   Connection name: NikahSalon DB
   Connection group: (boş bırakabilirsiniz)
   Connect using: Server and Port
   Server Address: localhost
   Port: 5432
   Database: nikahsalon
   Username: enescikcik
   Password: your_password
   ```

3. **Test edin:**
   - "Test Connection" butonuna tıklayın
   - Başarılı olursa "Save Connection" yapın

**PostgreSQL Extension için:**

1. **Command Palette açın:** `Ctrl+Shift+P` (veya `Cmd+Shift+P`)
2. **"PostgreSQL: Add Connection"** yazın
3. **Bağlantı bilgilerini girin:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `nikahsalon`
   - Username: `enescikcik`
   - Password: `your_password`

## 🔍 Extension'lar Ne Yapabilir?

### ✅ Yapabilirler:
- Mevcut veritabanlarına bağlanma
- Tabloları görüntüleme
- SQL sorguları çalıştırma
- Veritabanı içeriğini görüntüleme
- Bazı extension'lar veritabanı oluşturabilir

### ❌ Yapamazlar:
- PostgreSQL container'ı oluşturma
- Docker container'ı başlatma/durdurma
- Sistem seviyesinde kullanıcı oluşturma (bazıları yapabilir ama sınırlı)

## 📊 Karşılaştırma

| İşlem | Container'da (WSL) | Extension |
|-------|-------------------|-----------|
| Container oluşturma | ✅ Yapabilir | ❌ Yapamaz |
| Veritabanı oluşturma | ✅ Yapabilir | ⚠️ Bazıları yapabilir |
| Kullanıcı oluşturma | ✅ Yapabilir | ⚠️ Sınırlı |
| İzin ayarlama | ✅ Tam kontrol | ⚠️ Sınırlı |
| Bağlanma | ✅ Yapabilir | ✅ Yapabilir |
| SQL sorguları | ✅ Yapabilir | ✅ Yapabilir |

## 🚀 Hızlı Başlangıç

### 1. Container'da Oluştur (5 dakika)

```bash
# WSL'de
docker exec -it sehitkamil_db psql -U postgres <<EOF
CREATE USER enescikcik WITH PASSWORD 'your_password';
CREATE DATABASE nikahsalon OWNER enescikcik;
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;
\q
EOF
```

### 2. Extension ile Bağlan (2 dakika)

1. SQLTools veya PostgreSQL extension'ını açın
2. "Add New Connection" → Bağlantı bilgilerini girin
3. Test edin ve kaydedin

## ✅ Sonuç

**Önerilen sıra:**
1. ✅ Önce container'da veritabanı ve kullanıcı oluşturun (WSL'de)
2. ✅ Sonra extension ile bağlanın

Bu şekilde:
- ✅ Tam kontrol sahibi olursunuz
- ✅ İzinler doğru ayarlanır
- ✅ Extension sadece bağlanır ve kullanır
- ✅ Daha güvenli ve stabil

---

**Not:** Extension'lar sadece **mevcut** PostgreSQL sunucularına bağlanır. Container'ı ve temel yapıyı önce oluşturmanız gerekir.
