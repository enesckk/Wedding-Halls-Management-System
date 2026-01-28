# 🧪 SİSTEM TEST REHBERİ
**Tarih:** 28 Ocak 2026

---

## 🚀 SİSTEM BAŞLATMA

### Backend (API)
```bash
cd wedding-hall-api
dotnet run --project src/NikahSalon.API
```
**URL:** http://localhost:5230  
**Swagger:** http://localhost:5230/swagger (Development modunda)

### Frontend (UI)
```bash
cd wedding-hall-ui
npm run dev
```
**URL:** http://localhost:3000

---

## ✅ SİSTEM KONTROLLERİ

### 1. Backend Health Check
```bash
curl http://localhost:5230/api/v1/health
```
**Beklenen:** `{"status":"healthy"}` veya benzeri JSON yanıt

### 2. Frontend Erişim
Tarayıcıda aç: http://localhost:3000  
**Beklenen:** Login sayfası veya dashboard

---

## 🔐 TEST KULLANICILARI

### Viewer (Görüntüleme)
- **Email:** `viewer@nikahsalon.local`
- **Şifre:** `Viewer1!`
- **Yetkiler:** Sadece okuma

### Editor (Düzenleme)
- **Email:** `editor@nikahsalon.local`
- **Şifre:** `Editor1!`
- **Yetkiler:** Okuma + Yazma

---

## 📋 TEST SENARYOLARI

### 1. Authentication Test
- [ ] Login sayfasına git
- [ ] Viewer ile login yap
- [ ] Token alındığını kontrol et
- [ ] Dashboard'a yönlendirildiğini kontrol et
- [ ] Logout yap

### 2. Halls (Salonlar) Test
- [ ] Salonlar listesini görüntüle
- [ ] Bir salonun detaylarını görüntüle
- [ ] Editor ile login yap
- [ ] Yeni salon oluştur
- [ ] Salon bilgilerini güncelle
- [ ] Salon görseli yükle

### 3. Schedules (Takvim) Test
- [ ] Takvim görünümünü aç
- [ ] Salon müsaitliklerini görüntüle
- [ ] Editor ile yeni schedule oluştur
- [ ] Schedule güncelle
- [ ] Schedule sil

### 4. Requests (Talepler) Test
- [ ] Viewer ile yeni talep oluştur
- [ ] Talep detaylarını görüntüle
- [ ] Editor ile talepleri listele
- [ ] Talep onayla/reddet
- [ ] Talep mesajlarına bak

### 5. Messages (Mesajlar) Test
- [ ] Talep üzerinden mesaj gönder
- [ ] Mesajları görüntüle
- [ ] Mesaj sil

### 6. Dashboard Test
- [ ] Dashboard istatistiklerini görüntüle
- [ ] Talepler özetini görüntüle
- [ ] Takvim özetini görüntüle

---

## 🧪 API ENDPOINT TESTLERİ

### Health Check
```bash
curl http://localhost:5230/api/v1/health
```

### Login
```bash
curl -X POST http://localhost:5230/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@nikahsalon.local","password":"Viewer1!"}'
```

### Get Current User (Token gerekli)
```bash
curl http://localhost:5230/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Halls
```bash
curl http://localhost:5230/api/v1/halls \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Requests
```bash
curl http://localhost:5230/api/v1/requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Dashboard Stats
```bash
curl http://localhost:5230/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 SORUN GİDERME

### Backend Başlamıyor
1. PostgreSQL çalışıyor mu kontrol et:
   ```bash
   pg_isready -h localhost -p 5432
   ```
2. Port 5230 kullanımda mı kontrol et:
   ```bash
   lsof -i :5230
   ```
3. Database connection string kontrol et:
   - `appsettings.json` veya `appsettings.Development.json`

### Frontend Başlamıyor
1. Node modules yüklü mü:
   ```bash
   npm install
   ```
2. Port 3000 kullanımda mı:
   ```bash
   lsof -i :3000
   ```
3. Environment variables kontrol et:
   - `.env.local` dosyasında `NEXT_PUBLIC_API_URL=http://localhost:5230`

### API Bağlantı Hatası
1. Backend çalışıyor mu kontrol et
2. CORS ayarlarını kontrol et
3. `NEXT_PUBLIC_API_URL` doğru mu kontrol et

### Authentication Hatası
1. Token geçerli mi kontrol et
2. Token süresi dolmuş mu kontrol et
3. Role yetkileri doğru mu kontrol et

---

## 📊 TEST SCRIPTLERİ

### Sistem Testi
```bash
cd wedding-hall-ui
./test-system.sh
```

### API Endpoint Testi
```bash
cd wedding-hall-ui
NEXT_PUBLIC_API_URL=http://localhost:5230 ./test-api-endpoints.sh
```

---

## ✅ BAŞARILI TEST KRİTERLERİ

- ✅ Backend health endpoint yanıt veriyor
- ✅ Frontend açılıyor ve çalışıyor
- ✅ Login başarılı
- ✅ Token alınıyor ve saklanıyor
- ✅ API çağrıları başarılı
- ✅ Tüm sayfalar yükleniyor
- ✅ CRUD işlemleri çalışıyor
- ✅ Role-based authorization çalışıyor
- ✅ Error handling çalışıyor
- ✅ CORS sorunları yok

---

**Test Tarihi:** 28 Ocak 2026  
**Durum:** Sistem başlatıldı ve test için hazır
