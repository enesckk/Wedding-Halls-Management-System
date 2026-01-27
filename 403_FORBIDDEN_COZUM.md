# 403 Forbidden Hatası - Çözüm

## 🔴 Sorun: `GET /api/v1/requests` → 403 Forbidden

Backend'de `GET /api/v1/requests` endpoint'i **sadece Editor rolüne** açık.

## ✅ Çözümler

### 1. Kullanıcı Rolünü Kontrol Edin

**Backend'de:**
- `GET /api/v1/requests` → `[Authorize(Roles = "Editor")]` (sadece Editor)
- `POST /api/v1/requests` → `[Authorize(Roles = "Viewer")]` (Viewer ve Editor)

**Frontend'de:**
- Talepler sayfası (`/dashboard/talepler`) sadece Editor'ler görebilmeli
- Viewer'lar sadece talep oluşturabilir, listeleyemez

### 2. Giriş Yapın ve Editor Rolü ile Giriş Yapın

**Test kullanıcıları (backend'de seed data):**
- `editor@nikahsalon.local` / `Editor1!` → Editor rolü
- `viewer@nikahsalon.local` / `Viewer1!` → Viewer rolü

**Giriş yapın:**
1. Frontend'de giriş sayfasına gidin
2. `editor@nikahsalon.local` / `Editor1!` ile giriş yapın
3. Talepler sayfasına gidin (`/dashboard/talepler`)

### 3. Token Kontrolü

**Browser Console'da kontrol edin:**

```javascript
// Token var mı?
sessionStorage.getItem('token')

// Token varsa, decode edin (JWT)
const token = sessionStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Role:', payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
  console.log('User ID:', payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier']);
}
```

### 4. Frontend'de Rol Kontrolü

`/dashboard/talepler` sayfası sadece Editor'lere açık olmalı.

**Kontrol edin:**
- `lib/dashboard-routes.ts` dosyasında `talepler` Editor-only olarak işaretli mi?
- `AuthGuard` component'i doğru çalışıyor mu?

### 5. Backend Loglarını Kontrol Edin

Backend'de şu hataları görebilirsiniz:
- `401 Unauthorized` → Token yok veya geçersiz
- `403 Forbidden` → Token var ama rol yeterli değil

## 🔍 Hızlı Test

### 1. Editor ile Giriş Yapın

```bash
# Frontend'de
Email: editor@nikahsalon.local
Password: Editor1!
```

### 2. Talepler Sayfasına Gidin

`/dashboard/talepler` sayfasına gidin. Artık 403 hatası almamalısınız.

### 3. Viewer ile Test Edin

```bash
# Frontend'de
Email: viewer@nikahsalon.local
Password: Viewer1!
```

Viewer ile giriş yapınca talepler sayfasına erişememeli (redirect edilmeli).

## 📋 Kontrol Listesi

- [ ] Editor rolü ile giriş yaptınız mı?
- [ ] Token sessionStorage'da var mı?
- [ ] Token geçerli mi? (süresi dolmamış mı?)
- [ ] Frontend'de rol kontrolü yapılıyor mu?
- [ ] Backend'de endpoint doğru rol kontrolü yapıyor mu?

## 🎯 Beklenen Davranış

- **Editor:** Talepleri görebilir, yanıtlayabilir
- **Viewer:** Talepleri göremez, sadece yeni talep oluşturabilir

---

**Önemli:** 403 Forbidden hatası, yetkilendirme (authorization) sorunu demektir. Token var ama rol yeterli değil. Editor rolü ile giriş yapın!
