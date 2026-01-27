# ✅ Başarılı Kurulum - Test ve Sonraki Adımlar

## ✅ Oluşturulanlar

- ✅ Kullanıcı: `enescikcik`
- ✅ Veritabanı: `nikahsalon`
- ✅ İzinler: Verildi

## 🧪 Test

### 1. Bağlantı Testi

Container içinde veya dışında:

```bash
# Container içindeyken
psql -U enescikcik -d nikahsalon

# Container dışındayken (WSL Ubuntu)
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon
```

Başarılı olursa şunu görmelisiniz:
```
psql (15.x)
Type "help" for help.

nikahsalon=>
```

### 2. Veritabanını Kontrol Edin

psql içinde:

```sql
-- Mevcut kullanıcıyı kontrol edin
SELECT current_user;

-- Veritabanını kontrol edin
\l

-- Çıkış
\q
```

## 📝 Backend Connection String Güncelleme

`appsettings.Development.json` dosyasını açın:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
  }
}
```

**Önemli:** `your_password` yerine oluşturduğunuz şifreyi yazın!

## 🚀 Backend'i Çalıştırın

Windows PowerShell'de:

```powershell
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend\src\NikahSalon.API
dotnet run
```

Artık bağlantı hatası almamalısınız!

## 🔌 VS Code/Cursor Extension ile Bağlanma

Extension ile bağlanmak için:

- **Server Address:** `localhost`
- **Port:** `5432`
- **Database:** `nikahsalon`
- **Username:** `enescikcik`
- **Password:** `your_password` (oluşturduğunuz şifre)

## ✅ Kontrol Listesi

- [x] Kullanıcı oluşturuldu (`enescikcik`)
- [x] Veritabanı oluşturuldu (`nikahsalon`)
- [x] İzinler verildi
- [ ] Connection string güncellendi
- [ ] Backend başarıyla çalıştı
- [ ] Extension ile bağlantı test edildi

---

**Tebrikler!** Veritabanı hazır. Şimdi backend'i çalıştırabilirsiniz! 🎉
