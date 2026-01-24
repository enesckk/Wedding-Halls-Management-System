# Frontend Test Listesi ve Eksikler

## Nasıl test edilir?

```bash
cd wedding-hall-ui
pnpm install   # gerekirse
pnpm dev       # http://localhost:3000
```

Tarayıcıda `http://localhost:3000` aç. Giriş sayfası gelmeli.

---

## ✅ Test adımları (manuel)

### 1. Giriş sayfası (/)
- [ ] E-posta + şifre girip "Giriş Yap" → dashboard'a gidiyor mu?
- [ ] Demo hesaplardan **Ahmet Yılmaz (Admin)** ile hızlı giriş → sidebar'da "Ahmet Yılmaz", "Admin" görünüyor mu?
- [ ] Çıkış yap → tekrar giriş sayfası. **Mehmet Demir (Personel)** ile hızlı giriş → sidebar'da "Mehmet Demir", "Personel" görünüyor mu?
- [ ] **Ayşe Kaya (Personel)** ile giriş → Ayarlar menüsü **görünmemeli** (sadece admin).

### 2. Dashboard ana sayfa (/dashboard)
- [ ] Takvim görünümü yükleniyor mu?
- [ ] Etkinlikler (nikah, nişan vb.) görünüyor mu?

### 3. Salonlar (/dashboard/salonlar)
- [ ] Salon kartları listeleniyor mu?
- [ ] "Detayları Gör" → `/dashboard/[id]` (salon detay) açılıyor mu?

### 4. Salon detay (/dashboard/[id])
- [ ] Görsel, adres, kapasite, müsaitlik tablosu görünüyor mu?
- [ ] "Rezervasyon Talebi" modalı açılıyor mu?
- [ ] Admin ile girişte "Düzenleme Yetkisi" badge'i var mı? Personel ile "Sadece Görüntüleme" var mı?

### 5. Talepler (/dashboard/talepler)
- [ ] Admin: Tüm talepler listeleniyor mu?
- [ ] Personel (Mehmet/Ayşe): Sadece kendi talepleri görünüyor mu?
- [ ] "Yeni Talep" ile talep oluştur → listede çıkıyor mu?
- [ ] Talep detayında yanıt yazıp gönder → yanıt ekleniyor mu?
- [ ] Beklemede / Onaylandı / Reddedildi badge'leri doğru mu?

### 6. Mesajlar (/dashboard/mesajlar)
- [ ] General / Duyurular sekmeleri çalışıyor mu?
- [ ] Mesaj gönder → listeye ekleniyor mu?
- [ ] Admin: Duyurular'a yazabiliyor mu? Personel: sadece general?

### 7. Takvim (/dashboard/takvim)
- [ ] Takvim görünümü açılıyor mu?
- [ ] Etkinlikler doğru tarihlerde mi?

### 8. Ayarlar (/dashboard/ayarlar) – sadece Admin
- [ ] Admin ile: Sayfa açılıyor mu? Profil, bildirim, güvenlik, sistem ayarları görünüyor mu?
- [ ] "Değişiklikleri Kaydet" / "Şifreyi Değiştir" tıklanınca şu an sadece UI (API yok).

### 9. Çıkış
- [ ] Sidebar’dan "Çıkış Yap" → giriş sayfasına dönüyor mu?
- [ ] `/dashboard`’a doğrudan gitmeye çalışmak → şu an engellenmiyor (route koruması yok).

---

## ❌ Bilinen eksikler

| Eksik | Açıklama |
|-------|----------|
| **API entegrasyonu** | Veriler `lib/data.ts` mock. Backend API’ye `fetch`/axios yok. |
| **Gerçek auth** | Giriş simüle. JWT yok, API’de `/auth/login` çağrılmıyor. |
| **Route koruması** | `/dashboard` koruması yok. Giriş yapmadan URL ile erişilebiliyor. |
| **Rol uyumsuzluğu** | UI: `admin` / `staff`. API: `Viewer` / `Editor`. Eşleme yok. |
| **Mesajlar API’de yok** | Backend’de mesaj endpoint’i yok. "Mesajlar" sadece mock. |
| **Talepler status** | UI: pending/approved/rejected. API: Pending/Answered. |
| **Ayarlar kaydetme** | Butonlar çalışmıyor, API yok. |
| **Salon ekleme/düzenleme** | UI’da CRUD yok. API’de var (Editor). |
| **Schedule güncelleme** | UI’da müsaitlik düzenleme yok. API’de PUT /schedules/{id} var. |
| **Env / API URL** | `NEXT_PUBLIC_API_URL` yok. API base URL tanımlı değil. |

---

## 🔧 Hızlı giriş düzeltmesi (yapıldı)

- **Önce:** Hızlı girişte hangi kullanıcıyı seçersen seç, hep Ahmet (users[0]) görünüyordu.
- **Şimdi:** Seçilen kullanıcı `sessionStorage`’a yazılıyor, `UserProvider` okur. Mehmet/Ayşe ile girişte sidebar’da doğru isim ve rol görünür.

---

## Özet

- **Test:** Yukarıdaki adımlarla UI’yı manuel test edebilirsin. Veriler mock olduğu için hepsi lokal.
- **Eksik:** API bağlantısı, JWT auth, route koruması, rol eşlemesi ve bazı ekranların (ayarlar, mesajlar) backend’e bağlanması henüz yok.
