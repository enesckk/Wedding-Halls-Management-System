# Veritabanı Tabloları Oluşturma

## 🔴 Sorun: "tablolar yok, schema boş"

Backend çalışıyor ama veritabanında tablolar oluşmamış. Entity Framework tabloları oluşturmamış olabilir.

## ✅ Çözüm 1: Backend'i Yeniden Çalıştırın

Backend'de `EnsureCreatedAsync` kullanılıyorsa, ilk çalıştırmada tablolar otomatik oluşturulmalı.

```powershell
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API
dotnet run
```

Backend başlarken tabloları oluşturmalı. Logları kontrol edin.

## ✅ Çözüm 2: Veritabanında Tabloları Kontrol Edin

WSL Ubuntu'da:

```bash
# Veritabanına bağlanın
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon
```

psql içinde:

```sql
-- Tabloları listele
\dt

-- Veya
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Çıkış
\q
```

Eğer tablo yoksa, backend'in tabloları oluşturması gerekiyor.

## ✅ Çözüm 3: Migration Kullanılıyorsa

Eğer backend'de migration kullanılıyorsa:

```powershell
# Backend klasöründe
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API

# Migration oluştur (eğer yoksa)
dotnet ef migrations add InitialCreate

# Veritabanını güncelle
dotnet ef database update
```

## ✅ Çözüm 4: EnsureCreatedAsync Kontrolü

Backend'de `Program.cs` dosyasında `EnsureCreatedAsync` kullanılıyorsa, tablolar otomatik oluşturulmalı.

**Kontrol için:**

1. Backend'i çalıştırın
2. Logları kontrol edin - tablo oluşturma mesajları olmalı
3. Veritabanında tabloları kontrol edin

## 🔍 Hızlı Kontrol

### 1. Backend Loglarını Kontrol Edin

Backend çalışırken şu mesajları görmelisiniz:
- "Creating database..."
- "Database created successfully"
- Veya tablo oluşturma mesajları

### 2. Veritabanında Tabloları Kontrol Edin

```bash
# WSL Ubuntu'da
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon -c "\dt"
```

**Beklenen çıktı:**
```
Schema | Name | Type  | Owner
-------+------+-------+-------
public | Halls | table | enescikcik
public | Users | table | enescikcik
...
```

Eğer boşsa, tablolar oluşturulmamış demektir.

## 🎯 Manuel Tablo Oluşturma (Geçici)

Eğer backend tabloları oluşturmuyorsa, migration dosyalarını kontrol edin veya backend'i yeniden başlatın.

## 📋 Kontrol Listesi

- [ ] Backend başarıyla çalışıyor mu?
- [ ] Connection string doğru mu?
- [ ] Veritabanında tablolar var mı? (`\dt` ile kontrol)
- [ ] Backend loglarında hata var mı?
- [ ] `EnsureCreatedAsync` çalıştı mı?

---

**Önemli:** Backend ilk çalıştırmada tabloları otomatik oluşturmalı. Eğer oluşturmuyorsa, logları kontrol edin veya migration kullanın.
