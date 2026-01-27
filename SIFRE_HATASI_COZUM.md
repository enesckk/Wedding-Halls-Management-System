# Şifre Doğrulama Hatası - Çözüm

## 🔴 Hata: "password authentication failed for user enescikcik"

Bu hata, şifrenin yanlış girildiği veya extension'da doğru ayarlanmadığı anlamına gelir.

## ✅ Çözüm 1: Şifreyi Kontrol Edin

### Extension'da Şifre Ayarlama

1. **SQLTools Driver Credentials** butonuna tıklayın
2. Şifreyi girin: `your_password` (oluştururken kullandığınız şifre)
3. Şifrenin doğru olduğundan emin olun (büyük/küçük harf duyarlı)

### Backend Connection String'de Şifre

`appsettings.Development.json` dosyasında:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=your_password"
  }
}
```

**Önemli:** `your_password` yerine gerçek şifrenizi yazın!

## ✅ Çözüm 2: Şifreyi Yeniden Oluşturun

Eğer şifreyi unuttuysanız veya yanlış girildiyse:

### WSL Ubuntu'da:

```bash
# admin kullanıcısı ile bağlanın
docker exec -it sehitkamil_db psql -U admin -d superapp
```

psql içinde:

```sql
-- Mevcut şifreyi değiştir
ALTER USER enescikcik WITH PASSWORD 'yeni_sifre_buraya';

-- Çıkış
\q
```

### Tek Komut:

```bash
docker exec -it sehitkamil_db psql -U admin -d superapp -c "ALTER USER enescikcik WITH PASSWORD 'yeni_sifre_buraya';"
```

## ✅ Çözüm 3: Kullanıcıyı Yeniden Oluşturun

Eğer sorun devam ediyorsa:

```bash
# admin ile bağlanın
docker exec -it sehitkamil_db psql -U admin -d superapp
```

psql içinde:

```sql
-- Eski kullanıcıyı sil (dikkatli!)
DROP USER IF EXISTS enescikcik;

-- Yeni kullanıcı oluştur
CREATE USER enescikcik WITH PASSWORD 'yeni_sifre_buraya';

-- İzinleri ver
GRANT ALL PRIVILEGES ON DATABASE nikahsalon TO enescikcik;

-- Çıkış
\q
```

## 🔍 Şifre Kontrolü

### Test Bağlantısı

WSL Ubuntu'da:

```bash
# Şifre ile test edin
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon
```

Şifre sorulacak, doğru şifreyi girin.

## 📝 Extension'da Şifre Ayarlama (Detaylı)

1. **Connection Assistant'da:**
   - "Use password" bölümünde "SQLTools Driver Credentials" butonuna tıklayın
   - Açılan pencerede şifreyi girin
   - Şifreyi kaydedin

2. **Alternatif - Connection String'de:**
   - Bazı extension'lar connection string formatını destekler
   - Format: `postgresql://enescikcik:your_password@localhost:5432/nikahsalon`

## 🎯 Hızlı Çözüm

### 1. Şifreyi Yeniden Ayarlayın

```bash
# WSL Ubuntu'da
docker exec -it sehitkamil_db psql -U admin -d superapp -c "ALTER USER enescikcik WITH PASSWORD 'yeni_sifre_buraya';"
```

### 2. Extension'da Şifreyi Güncelleyin

- Connection Assistant'da "SQLTools Driver Credentials" butonuna tıklayın
- Yeni şifreyi girin: `yeni_sifre_buraya`

### 3. Backend Connection String'i Güncelleyin

`appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=enescikcik;Password=yeni_sifre_buraya"
  }
}
```

## ✅ Test

```bash
# WSL Ubuntu'da
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon
```

Şifre sorulacak, yeni şifreyi girin. Başarılı olursa `nikahsalon=>` görmelisiniz.

---

**Önemli:** Şifreler büyük/küçük harf duyarlıdır. Extension ve backend'de aynı şifreyi kullandığınızdan emin olun!
