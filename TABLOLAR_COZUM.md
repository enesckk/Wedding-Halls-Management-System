# Veritabanı Tabloları Oluşturma - Hızlı Çözüm

## 🔴 Sorun: "tablolar yok, schema boş"

Backend çalışıyor ama veritabanında tablolar oluşmamış. `EnsureCreatedAsync` çalışmamış olabilir.

## ✅ Hızlı Çözüm

### 1. Veritabanında Tabloları Kontrol Edin

WSL Ubuntu'da:

```bash
# Tabloları listele
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon -c "\dt"
```

**Eğer boşsa:** Tablolar oluşturulmamış.

### 2. Backend'i Yeniden Başlatın

Backend'de `EnsureCreatedAsync` kullanılıyor. Backend'i yeniden başlatın:

```powershell
# Backend'i durdurun (Ctrl+C)
# Sonra tekrar başlatın
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API
dotnet run
```

Backend başlarken tabloları oluşturmalı. Logları kontrol edin.

### 3. Backend Loglarını Kontrol Edin

Backend başlarken şu mesajları görmelisiniz:
- "Creating database..."
- "Database created successfully"
- Veya tablo oluşturma mesajları

Eğer hata varsa, logları kontrol edin.

## 🔍 Tabloları Manuel Kontrol

### WSL Ubuntu'da:

```bash
# Veritabanına bağlanın
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon
```

psql içinde:

```sql
-- Tabloları listele
\dt

-- Veya SQL ile
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Schema'yı kontrol edin
\dn

-- Çıkış
\q
```

**Beklenen tablolar:**
- `AspNetUsers`
- `AspNetRoles`
- `AspNetUserRoles`
- `WeddingHalls` (veya `Halls`)
- `Schedules`
- `Requests`
- vb.

## 🎯 Eğer Tablolar Hala Yoksa

### Çözüm 1: Backend'i Temiz Başlatın

1. Backend'i tamamen durdurun (Ctrl+C)
2. Backend'i yeniden başlatın
3. Logları kontrol edin

### Çözüm 2: Migration Kullanın (Eğer Varsa)

```powershell
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API

# Migration oluştur
dotnet ef migrations add InitialCreate

# Veritabanını güncelle
dotnet ef database update
```

### Çözüm 3: Connection String'i Kontrol Edin

`appsettings.Development.json` dosyasında:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
  }
}
```

**Kontrol edin:**
- ✅ Şifre doğru mu?
- ✅ Veritabanı adı doğru mu? (`nikahsalon`)
- ✅ Kullanıcı adı doğru mu? (`enescikcik`)

## 📋 Kontrol Listesi

- [ ] Backend başarıyla çalışıyor mu?
- [ ] Connection string doğru mu?
- [ ] Veritabanında tablolar var mı? (`\dt` ile kontrol)
- [ ] Backend loglarında hata var mı?
- [ ] `EnsureCreatedAsync` çalıştı mı?

## 🚀 Hızlı Test

1. **Backend'i durdurun** (Ctrl+C)
2. **Backend'i yeniden başlatın:**
   ```powershell
   dotnet run
   ```
3. **Logları kontrol edin** - tablo oluşturma mesajları olmalı
4. **Veritabanında tabloları kontrol edin:**
   ```bash
   docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon -c "\dt"
   ```

---

**Önemli:** Backend ilk çalıştırmada `EnsureCreatedAsync` ile tabloları otomatik oluşturmalı. Eğer oluşturmuyorsa, logları kontrol edin!
