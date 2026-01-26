# Security HTTP Headers

**Tarih:** 2026-01-23  
**Middleware:** `SecurityHeadersMiddleware`

---

## ✅ Eklenen Security Headers

Aşağıdaki security headers tüm API response'larına otomatik olarak eklenir:

| Header | Değer | Açıklama |
|--------|-------|----------|
| **X-Content-Type-Options** | `nosniff` | MIME type sniffing'i engeller |
| **X-Frame-Options** | `DENY` | Clickjacking saldırılarını engeller |
| **Referrer-Policy** | `no-referrer` | Referrer bilgisinin gönderilmesini engeller |
| **X-XSS-Protection** | `0` | Eski tarayıcıların XSS filtrelerini devre dışı bırakır (modern tarayıcılar CSP kullanır) |
| **Content-Security-Policy** | `default-src 'self'` | Sadece aynı origin'den kaynak yüklemesine izin verir |

---

## 📁 Dosya Yapısı

```
src/NikahSalon.API/
  └── Middleware/
      ├── ExceptionHandlingMiddleware.cs
      └── SecurityHeadersMiddleware.cs  ← Yeni eklendi
```

---

## ⚙️ Yapılandırma

### Program.cs

```csharp
var app = builder.Build();

app.UseMiddleware<SecurityHeadersMiddleware>();  // ← İlk middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();
// ... diğer middleware'ler
```

**Not:** SecurityHeadersMiddleware, ExceptionHandlingMiddleware'den **önce** çalışır, böylece tüm response'lara (hata response'ları dahil) header'lar eklenir.

---

## 🔍 Test

### Manuel Test

```bash
# Herhangi bir endpoint'e istek at
curl -I http://localhost:5231/api/v1/halls \
  -H "Authorization: Bearer <token>"

# Response headers'da şunları görmelisiniz:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Referrer-Policy: no-referrer
# X-XSS-Protection: 0
# Content-Security-Policy: default-src 'self'
```

### Browser DevTools

1. Network tab'ını aç
2. Herhangi bir API request'ine tıkla
3. Response Headers bölümünde security headers'ı gör

---

## 📝 Notlar

1. **CSP (Content-Security-Policy):** Şu anda minimal yapılandırılmış (`default-src 'self'`). İhtiyaç halinde genişletilebilir.
2. **X-XSS-Protection:** Modern tarayıcılar CSP kullandığı için bu header eski tarayıcılar için. `0` değeri eski filtreleri devre dışı bırakır.
3. **Global Uygulama:** Tüm endpoint'lere otomatik olarak uygulanır.
4. **Production Ready:** Bu header'lar production ortamında güvenlik için kritiktir.

---

## ✅ Sonuç

Security headers başarıyla eklendi:
- ✅ X-Content-Type-Options
- ✅ X-Frame-Options
- ✅ Referrer-Policy
- ✅ X-XSS-Protection
- ✅ Content-Security-Policy
- ✅ Global middleware olarak register edildi
- ✅ Build başarılı

**Not:** Backend yeniden başlatıldıktan sonra header'lar aktif olacaktır.
