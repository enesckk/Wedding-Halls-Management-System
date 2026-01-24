# Nikah Salonu Sistemi – Detaylı Test Raporu

**Tarih:** Ocak 2025  
**Kapsam:** Frontend (wedding-hall-ui), Backend (wedding-hall-api), Veritabanı (PostgreSQL), Entegrasyon

---

# 1. FRONTEND (wedding-hall-ui)

## 1.1 Yapılanlar ✅

| Özellik | Durum | Açıklama |
|--------|--------|----------|
| **Giriş sayfası (/)** | ✅ | E-posta/şifre formu, "Giriş Yap", demo hesaplarla hızlı giriş |
| **Hızlı giriş kullanıcı seçimi** | ✅ | Seçilen kullanıcı `sessionStorage` ile saklanıyor, sidebar’da doğru isim/rol |
| **Dashboard layout** | ✅ | Sidebar, UserProvider, ana içerik alanı |
| **Sidebar** | ✅ | Logo, menü (Ana Sayfa, Takvim, Salonlar, Mesajlar, Talepler, Ayarlar), rol bazlı filtre, kullanıcı bilgisi, çıkış |
| **Ana sayfa (/dashboard)** | ✅ | Takvim görünümü, mock etkinlikler |
| **Salonlar (/dashboard/salonlar)** | ✅ | Salon kartları listesi, `lib/data` → `weddingHalls` |
| **Salon detay (/dashboard/[id])** | ✅ | Görsel, adres, kapasite, müsaitlik tablosu, "Rezervasyon Talebi" modalı |
| **Talepler (/dashboard/talepler)** | ✅ | Liste, filtre (admin: tümü, personel: kendi), yeni talep formu, talep detay, yanıt yazma |
| **Mesajlar (/dashboard/mesajlar)** | ✅ | General / Duyurular sekmeleri, mesaj listesi, mesaj gönderme (admin duyurulara yazabiliyor) |
| **Takvim (/dashboard/takvim)** | ✅ | Haftalık/günlük görünüm, mock etkinlikler |
| **Ayarlar (/dashboard/ayarlar)** | ✅ | Sadece admin menüde, profil/bildirim/güvenlik/sistem ayarları formları (kaydetme yok) |
| **Müsaitlik tablosu** | ✅ | Saat aralığı, müsait/dolu badge, admin için Switch ile toggle (sadece local state) |
| **Talep modalı (salon detay)** | ✅ | Mesaj yazıp gönder, simüle API → "Talebiniz iletildi!" (gerçek API yok) |
| **Çıkış** | ✅ | `sessionStorage` temizleniyor, `/` yönlendirme |
| **UI kütüphanesi** | ✅ | shadcn/ui, Tailwind, Lucide ikonlar |
| **Veri kaynağı** | ✅ | Tümü `lib/data.ts` mock (users, weddingHalls, mockMessages, mockRequests, mockEvents) |
| **Tipler** | ✅ | `lib/types.ts` (User, WeddingHall, TimeSlot, Message, Request, Event vb.) |

## 1.2 Yapılmayanlar ❌

| Eksik | Açıklama |
|-------|----------|
| **API çağrıları** | Hiç `fetch` / `axios` yok. Tüm veri `lib/data.ts` mock. |
| **JWT / gerçek auth** | Giriş simüle (1 sn bekle → dashboard). Token yok, backend `/auth/login` çağrılmıyor. |
| **API base URL** | `NEXT_PUBLIC_API_URL` veya benzeri env yok. |
| **Route koruması** | `/dashboard` koruması yok. Giriş yapmadan URL ile erişilebiliyor. |
| **Salon CRUD UI** | Salon ekleme/düzenleme/silme ekranı yok. (Backend’de POST/PUT halls var.) |
| **Schedule güncelleme UI** | Müsaitlik tablosundaki değişiklikler sadece local state. API `PUT /schedules/{id}` çağrılmıyor. |
| **Ayarlar kaydetme** | "Değişiklikleri Kaydet", "Şifreyi Değiştir" vb. butonlar işlevsiz. |
| **RequestModal → Talepler** | Modal "talep iletildi" diyor ama talepler sayfasına gerçek veri gitmiyor, API yok. |
| **.env dosyası** | Yok. API URL, env’ler tanımlı değil. |

---

# 2. BACKEND (wedding-hall-api)

## 2.1 Yapılanlar ✅

| Özellik | Durum | Açıklama |
|--------|--------|----------|
| **Clean Architecture** | ✅ | Domain, Application, Infrastructure, API katmanları ayrı |
| **CQRS (hafif)** | ✅ | Her use case için Command/Query + Handler (MediatR yok) |
| **Auth** | | |
| ├ POST /api/v1/auth/login | ✅ | Email + şifre, JWT döner (Identity) |
| └ GET /api/v1/auth/me | ✅ | [Authorize], JWT’den userId → UserInfo |
| **Halls** | | |
| ├ GET /api/v1/halls | ✅ | [Authorize] Viewer, Editor |
| ├ GET /api/v1/halls/{id} | ✅ | [Authorize] |
| ├ GET /api/v1/halls/{id}/schedules | ✅ | [Authorize] |
| ├ POST /api/v1/halls | ✅ | [Authorize(Roles=Editor)] |
| └ PUT /api/v1/halls/{id} | ✅ | [Authorize(Roles=Editor)] |
| **Schedules** | | |
| └ PUT /api/v1/schedules/{id} | ✅ | [Authorize(Roles=Editor)] Çakışma kontrolü |
| **Requests** | | |
| ├ POST /api/v1/requests | ✅ | [Authorize(Roles=Viewer)] Body: WeddingHallId, Message |
| └ GET /api/v1/requests | ✅ | [Authorize(Roles=Editor)] |
| **JWT** | ✅ | Claims: userId, email, role. 1 saat. appsettings’ten config. |
| **Identity** | ✅ | ASP.NET Identity, ApplicationUser (FullName), roller Viewer / Editor |
| **FluentValidation** | ✅ | Login, CreateHall, UpdateHall, UpdateSchedule, CreateRequest |
| **Global exception middleware** | ✅ | `{ success, message, errors }` standart format |
| **Repository pattern** | ✅ | IWeddingHallRepository, IScheduleRepository, IRequestRepository, IUserRepository; Infra’da implementasyon |
| **Versioning** | ✅ | Tüm endpoint’ler `/api/v1` altında |

## 2.2 Yapılmayanlar ❌

| Eksik | Açıklama |
|-------|----------|
| **Mesajlar API** | Mesajlaşma / duyurular için endpoint yok. Frontend’de var, backend’de yok. |
| **Event API** | Takvim etkinlikleri (nikah, nişan vb.) için entity/endpoint yok. |
| **Request detay / yanıt** | GET /requests liste döner. Tekil talep (GET by id), yanıt ekleme (comment) API’de yok. |
| **Request status** | Sadece Pending / Answered. Frontend’deki approved/rejected yok. |
| **CORS** | Frontend farklı origin’den istek atacaksa CORS ayarı gerekir (şu an belirsiz). |
| **Swagger/OpenAPI** | Geliştirme için Swagger UI yok. |
| **Rate limiting / Production hardening** | Ek güvenlik ve limitler tanımlı değil. |

---

# 3. VERİTABANI (PostgreSQL)

## 3.1 Yapılanlar ✅

| Özellik | Durum | Açıklama |
|--------|--------|----------|
| **PostgreSQL** | ✅ | Npgsql, EF Core ile kullanılıyor |
| **DbContext** | ✅ | Identity + WeddingHalls, Schedules, Requests |
| **Tablolar** | ✅ | AspNetUsers, AspNetRoles, AspNetUserRoles, … ; WeddingHalls, Schedules, Requests |
| **Identity** | ✅ | ApplicationUser (Guid), FullName, roller |
| **Seed** | ✅ | Viewer / Editor rolleri; viewer@nikahsalon.local / Viewer1!, editor@nikahsalon.local / Editor1!; 2 salon, 2 schedule |
| **Şema oluşturma** | ✅ | `EnsureCreatedAsync` ile (migration yok) |
| **Connection string** | ✅ | appsettings: Host, Port, Database, Username, Password |
| **Design-time factory** | ✅ | EF migration için (şu an migration kullanılmıyor) |

## 3.2 Yapılmayanlar ❌

| Eksik | Açıklama |
|-------|----------|
| **EF Migration** | Migration kullanılmıyor, `EnsureCreated`. İleride migration’a geçilebilir. |
| **Messages tablosu** | Mesajlaşma için tablo yok. |
| **Events tablosu** | Takvim etkinlikleri için tablo yok. |
| **Request yanıtları** | Request entity’de yanıt (comment) alanı yok. |
| **Index / performans** | Ek index veya sorgu optimizasyonu yapılmadı. |

---

# 4. ENTEGRASYON (Frontend ↔ Backend ↔ DB)

## 4.1 Yapılanlar ✅

| Özellik | Durum | Açıklama |
|--------|--------|----------|
| **Proje ayrımı** | ✅ | Frontend ve backend ayrı klasörler (wedding-hall-ui, wedding-hall-api). |
| **API sözleşmesi** | ✅ | Backend endpoint’ler ve DTO’lar belli. Frontend henüz kullanmıyor. |

## 4.2 Yapılmayanlar ❌

| Eksik | Açıklama |
|-------|----------|
| **Frontend → API çağrıları** | Hiçbir sayfa/komponent API’yi çağırmıyor. |
| **Login → JWT** | Frontend login simüle. `/auth/login` çağrılmıyor, JWT alınmıyor. |
| **JWT taşıma** | `Authorization: Bearer <token>` ile istek yok. |
| **Rol eşlemesi** | Frontend: admin / staff. Backend: Viewer / Editor. Eşleme yapılmadı. |
| **Env (API URL)** | `NEXT_PUBLIC_API_URL` vb. yok. |
| **CORS** | Backend’de frontend origin’e izin veren CORS ayarı yok (gerekebilir). |
| **Ortak model uyumu** | Aşağıda özetlenen farklar var. |

---

# 5. MODEL FARKLARI (Frontend vs Backend / DB)

| Konu | Frontend | Backend / DB |
|------|----------|--------------|
| **Roller** | admin, staff | Viewer, Editor |
| **Kullanıcı** | id string, name, email, role | Guid, Email, FullName, Role (Identity) |
| **WeddingHall** | id string, availability: TimeSlot[] | Id Guid. Müsaitlik ayrı Schedule entity. |
| **TimeSlot / Schedule** | id, timeRange string, available/booked | Id, WeddingHallId, Date, StartTime, EndTime, Available/Reserved |
| **Request** | userId, userName, hallName, date, timeSlot, status: pending/approved/rejected, responses[] | CreatedByUserId, Message, Status: Pending/Answered. date, timeSlot, hallName, responses yok. |
| **Message** | Var (general, duyurular) | Yok |
| **Event** | Var (takvim) | Yok |

Bu farklar API entegrasyonu yapılırken ya frontend’in backend modeline uyarlanması ya da backend’in genişletilmesiyle giderilmeli.

---

# 6. ÖZET TABLO

| Alan | Yapıldı | Yapılmadı |
|------|---------|-----------|
| **Frontend** | Sayfalar, UI, mock veri, hızlı giriş, rol bazlı menü | API çağrıları, JWT, route koruması, salon CRUD, schedule güncelleme, ayarlar kaydetme, env |
| **Backend** | Auth, halls, schedules, requests, JWT, Identity, CQRS, validation, exception middleware | Mesajlar, Event API, request detay/yanıt, CORS, Swagger |
| **DB** | PostgreSQL, Identity, WeddingHalls, Schedules, Requests, seed | Migration, Messages, Events, request yanıtları |
| **Entegrasyon** | Projeler ayrı, API tarafı hazır | Frontend→API bağlantısı yok, login/JWT yok, rol eşlemesi yok, model uyumsuzlukları |

---

# 7. SONUÇ

- **Frontend:** Çalışan bir UI var; tüm veri mock. API’ye bağlı değil.  
- **Backend:** Auth, halls, schedules, requests için API hazır. Mesajlar ve takvim etkinlikleri yok.  
- **DB:** Temel tablolar ve seed var. Mesajlar ve etkinlikler için şema yok.  
- **Entegrasyon:** Henüz yok. Login, JWT, rol eşlemesi ve model uyumu yapılıp frontend’in gerçek API’yi kullanması gerekiyor.

Bu rapor, verdiğin prompt’lara göre “neler yapıldı, neler yapılmadı” referansı olarak kullanılabilir.
