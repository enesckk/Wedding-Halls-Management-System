# Nikah Salonları Yönetim Sistemi - Kullanıcı Rehberi

**Sistem:** Belediye Nikah Salonları Yönetim ve Rezervasyon Sistemi  
**Hedef Kitle:** Belediye personeli (Viewer ve Editor rolleri)

---

## 👥 Kullanıcı Rolleri

### 🔵 Viewer (Görüntüleyici)
- **Kimler:** Genel belediye personeli, resepsiyon görevlileri
- **Yetkiler:** Salonları görüntüleme, talep oluşturma, takvimi görüntüleme
- **Kısıtlamalar:** Salon ekleme/düzenleme, talepleri yönetme yetkisi yok

### 🟢 Editor (Editör/Yönetici)
- **Kimler:** Sistem yöneticileri, salon yöneticileri
- **Yetkiler:** Tüm Viewer yetkileri + Salon ekleme/düzenleme, talep yönetimi, müsaitlik güncelleme
- **Özel Sayfalar:** Talepler, Ayarlar

---

## 🚀 Giriş ve İlk Adımlar

### 1. Giriş Yapma
- **URL:** `http://localhost:3000` (veya production URL)
- **Giriş Bilgileri:**
  - **Viewer:** `viewer@nikahsalon.local` / `Viewer1!`
  - **Editor:** `editor@nikahsalon.local` / `Editor1!`
- **Güvenlik:** JWT token otomatik olarak `sessionStorage`'da saklanır
- **Oturum:** 1 saat geçerli, sonra yeniden giriş gerekir

### 2. Dashboard'a Erişim
- Giriş sonrası otomatik olarak `/dashboard` sayfasına yönlendirilir
- **Koruma:** Giriş yapmadan dashboard sayfalarına erişilemez (401 redirect)

---

## 📱 Ana Menü ve Sayfalar

### Sol Menü (Sidebar)
Tüm kullanıcılar için:
- 🏠 **Ana Sayfa** - Takvim görünümü
- 📅 **Takvim** - Salon müsaitlik takvimi
- 🏢 **Salonlar** - Tüm nikah salonları listesi
- ➕ **Talep Et** - Yeni rezervasyon talebi oluşturma
- 💬 **Mesajlar** - Genel mesajlaşma (mock)

Sadece Editor için:
- 📄 **Talepler** - Gelen talepleri görüntüleme ve yönetme
- ⚙️ **Ayarlar** - Sistem ayarları

---

## 🎯 Kullanıcı Akışları

### 📋 Senaryo 1: Viewer - Salon Bilgilerini Görüntüleme

1. **Giriş Yap**
   - Viewer hesabı ile giriş yap

2. **Salonlar Sayfasına Git**
   - Sol menüden "Salonlar" tıklanır
   - Tüm nikah salonları kart görünümünde listelenir

3. **Salon Detayını Görüntüle**
   - Bir salon kartına tıklanır
   - Salon detay sayfası açılır:
     - Salon bilgileri (isim, adres, kapasite, açıklama)
     - Salon fotoğrafı
     - Müsaitlik tablosu (tarih ve saat bazlı)
     - "Talep Oluştur" butonu

4. **Müsaitlik Kontrolü**
   - Tarih ve saat aralıkları görüntülenir
   - Durumlar: ✅ Müsait / ❌ Rezerve
   - Sadece görüntüleme (değiştirme yetkisi yok)

---

### 📝 Senaryo 2: Viewer - Rezervasyon Talebi Oluşturma

#### Yöntem 1: "Talep Et" Sayfasından

1. **Talep Et Sayfasına Git**
   - Sol menüden "Talep Et" tıklanır

2. **Formu Doldur**
   - **Etkinlik Türü** (Zorunlu): Nikah, Nişan, Konser, Toplantı, Özel
   - **Etkinlik Adı** (Zorunlu): Örn. "Ahmet & Ayşe Nikah Töreni"
   - **Etkinlik Sahibi** (Zorunlu): Örn. "Ahmet Yılmaz"
   - **Salon Seçimi** (Zorunlu): Dropdown'dan salon seçilir
   - **Tarih** (Zorunlu): Tarih seçici ile
   - **Saat** (Zorunlu): Saat girişi (HH:mm formatı)
   - **Açıklama** (Opsiyonel): Ek bilgiler

3. **Talebi Gönder**
   - "Talep Gönder" butonuna tıklanır
   - Başarılı olursa toast mesajı gösterilir
   - Form temizlenir

#### Yöntem 2: Salon Detay Sayfasından

1. **Salon Detay Sayfasına Git**
   - Salonlar listesinden bir salon seçilir

2. **Talep Oluştur Butonuna Tıkla**
   - Salon detay sayfasında "Talep Oluştur" butonu
   - Modal açılır (aynı form)

3. **Formu Doldur ve Gönder**
   - Salon otomatik seçilidir
   - Diğer alanlar doldurulur
   - Gönderilir

---

### 📅 Senaryo 3: Viewer - Takvim Görüntüleme

1. **Takvim Sayfasına Git**
   - Sol menüden "Takvim" tıklanır
   - Veya Ana Sayfa'da takvim görünümü açılır

2. **Salon Seçimi**
   - Dropdown'dan bir salon seçilir
   - Veya "Tüm Salonlar" seçilir

3. **Takvim Görünümü**
   - Aylık takvim görünümü
   - Her gün için müsaitlik durumu gösterilir
   - Saat aralıkları görüntülenir
   - Müsait: Yeşil, Rezerve: Kırmızı

4. **Navigasyon**
   - Önceki/Sonraki ay butonları
   - Bugün'e dön butonu

---

### 🛠️ Senaryo 4: Editor - Salon Yönetimi

#### Salon Ekleme

1. **Salonlar Sayfasına Git**
   - Sol menüden "Salonlar" tıklanır

2. **Yeni Salon Ekle**
   - "Yeni Salon Ekle" butonuna tıklanır
   - Modal açılır

3. **Formu Doldur**
   - **Salon Adı** (Zorunlu)
   - **Adres** (Zorunlu)
   - **Kapasite** (Zorunlu, > 0)
   - **Açıklama** (Zorunlu)
   - **Görsel URL** (Zorunlu)

4. **Kaydet**
   - "Kaydet" butonuna tıklanır
   - Başarılı olursa liste güncellenir

#### Salon Düzenleme

1. **Salon Detay Sayfasına Git**
   - Salonlar listesinden bir salon seçilir

2. **Düzenle Butonuna Tıkla**
   - Salon detay sayfasında "Düzenle" butonu (sadece Editor görür)
   - Modal açılır (mevcut bilgilerle dolu)

3. **Bilgileri Güncelle**
   - İstenen alanlar değiştirilir
   - "Güncelle" butonuna tıklanır
   - Değişiklikler hemen yansır

---

### 📊 Senaryo 5: Editor - Müsaitlik Yönetimi

1. **Salon Detay Sayfasına Git**
   - Salonlar listesinden bir salon seçilir

2. **Müsaitlik Tablosunu Görüntüle**
   - Tarih ve saat aralıkları tablo halinde gösterilir
   - Her satır bir zaman dilimi

3. **Durum Değiştir**
   - Bir satıra tıklanır
   - Dropdown'dan yeni durum seçilir:
     - **Müsait** → Rezerve edilebilir
     - **Rezerve** → Dolu, rezervasyon yapılamaz

4. **Kaydet**
   - "Kaydet" butonuna tıklanır
   - Overlap kontrolü yapılır (aynı tarih ve saatte çakışma varsa hata)
   - Başarılı olursa tablo güncellenir

---

### 📋 Senaryo 6: Editor - Talep Yönetimi

1. **Talepler Sayfasına Git**
   - Sol menüden "Talepler" tıklanır (sadece Editor görür)

2. **Talepleri Görüntüle**
   - Tüm gelen talepler listelenir
   - Her talep için:
     - **Durum:** Beklemede (Sarı) / Yanıtlandı (Yeşil)
     - **Etkinlik Bilgileri:** Tür, ad, sahip, tarih, saat
     - **Salon:** Hangi salon için
     - **Mesaj:** Kullanıcının açıklaması
     - **Oluşturulma Tarihi**

3. **Talep Detayını Görüntüle**
   - Bir talebe tıklanır
   - Sağ panelde detaylar açılır

4. **Mesajlaşma**
   - Talep detayında mesaj listesi görüntülenir
   - Yeni mesaj gönderilebilir
   - Hem Viewer hem Editor mesaj gönderebilir

5. **Talep Yanıtlama (Editor)**
   - "Yanıtla" butonuna tıklanır
   - Talep durumu "Beklemede" → "Yanıtlandı" olur
   - İsteğe bağlı yanıt mesajı eklenebilir

---

## 🔐 Güvenlik ve Yetkilendirme

### Route Protection
- **Dashboard sayfaları:** Giriş yapmadan erişilemez (redirect to `/`)
- **Editor-only sayfalar:** Viewer erişmeye çalışırsa "Unauthorized" mesajı

### API Güvenliği
- Tüm API istekleri JWT token ile yapılır
- Token `sessionStorage`'da saklanır
- Token süresi dolunca otomatik logout

### Role-Based UI
- Editor-only butonlar Viewer'da görünmez
- Editor-only sayfalar Viewer'da menüde görünmez

---

## 💡 Kullanıcı İpuçları

### ✅ İyi Pratikler

1. **Talep Oluştururken:**
   - Tarih ve saat bilgilerini doğru girin
   - Salon seçimini dikkatli yapın
   - Açıklama alanını doldurun (opsiyonel ama önerilir)

2. **Müsaitlik Kontrolü:**
   - Takvim sayfasından tüm salonları görüntüleyebilirsiniz
   - Salon detay sayfasından detaylı müsaitlik görebilirsiniz

3. **Mesajlaşma:**
   - Talepler sayfasında mesajlaşma özelliği kullanılabilir
   - Mesajlar XSS korumalıdır (güvenli)

### ⚠️ Dikkat Edilmesi Gerekenler

1. **Overlap Kontrolü:**
   - Editor müsaitlik güncellerken aynı tarih ve saatte çakışma olmamalı
   - Sistem otomatik kontrol eder, hata verirse dikkate alın

2. **Token Süresi:**
   - 1 saat sonra oturum sonlanır
   - Uzun süre kullanmıyorsanız yeniden giriş yapın

3. **Form Validasyonu:**
   - Zorunlu alanlar boş bırakılamaz
   - Tarih formatı: YYYY-MM-DD
   - Saat formatı: HH:mm (24 saat)

---

## 🎨 Arayüz Özellikleri

### Tema
- **Dark Mode:** Sistem temasına göre otomatik
- **Responsive:** Mobil ve tablet uyumlu

### Bildirimler
- **Toast Mesajları:** Başarılı/hatalı işlemler için
- **Loading States:** İşlem sırasında yükleniyor göstergesi

### Navigasyon
- **Sidebar:** Sol tarafta sabit menü
- **Breadcrumb:** Sayfa konumu gösterimi (bazı sayfalarda)
- **Back Button:** Detay sayfalarında geri dön butonu

---

## 📞 Destek

### Test Hesapları
- **Viewer:** `viewer@nikahsalon.local` / `Viewer1!`
- **Editor:** `editor@nikahsalon.local` / `Editor1!`

### Sistem Bilgileri
- **Frontend:** Next.js 15 (React 19)
- **Backend:** ASP.NET Core 8 Web API
- **Database:** PostgreSQL
- **Authentication:** JWT (1 saat geçerli)

---

## 🔄 Sistem Akış Şeması

```
Giriş Sayfası (/)
    ↓
[Giriş Yap]
    ↓
Dashboard Ana Sayfa (/dashboard)
    ↓
┌─────────────────────────────────────┐
│  Viewer Akışı                       │
├─────────────────────────────────────┤
│  1. Salonları Görüntüle              │
│  2. Salon Detayını İncele            │
│  3. Takvimi Kontrol Et               │
│  4. Talep Oluştur                    │
│  5. Mesajlaş (talep üzerinden)      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Editor Akışı                        │
├─────────────────────────────────────┤
│  1. Tüm Viewer işlemleri +           │
│  2. Salon Ekle/Düzenle               │
│  3. Müsaitlik Güncelle               │
│  4. Talepleri Yönet                  │
│  5. Talepleri Yanıtla               │
│  6. Ayarları Yönet                   │
└─────────────────────────────────────┘
```

---

**Son Güncelleme:** 2026-01-26  
**Versiyon:** 1.0
