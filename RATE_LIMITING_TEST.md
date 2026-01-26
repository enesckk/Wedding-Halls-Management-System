# Rate Limiting Test Raporu

**Tarih:** 2026-01-23  
**Backend:** http://localhost:5231

---

## ✅ Yapılandırma

### Rate Limiting Policies

1. **Global Policy (Default)**
   - Limit: 100 requests per minute per IP
   - Queue Limit: 10
   - Uygulandığı yer: Tüm endpoint'ler (policy belirtilmeyen)

2. **LoginPolicy**
   - Limit: 5 requests per minute per IP
   - Queue Limit: 2
   - Uygulandığı yer: `POST /api/v1/auth/login`

3. **WritePolicy**
   - Limit: 20 requests per minute per IP
   - Queue Limit: 5
   - Uygulandığı yer:
     - `POST /api/v1/halls` (Create Hall)
     - `PUT /api/v1/halls/{id}` (Update Hall)
     - `PUT /api/v1/schedules/{id}` (Update Schedule)
     - `POST /api/v1/requests` (Create Request)
     - `PUT /api/v1/requests/{id}/answer` (Answer Request)
     - `POST /api/v1/requests/{id}/messages` (Create Message)

---

## 📋 Test Senaryoları

### Test 1: Login Endpoint Rate Limiting
**Beklenen:** 5 request'ten sonra 429 dönmeli

```bash
# 6 ardışık login request'i
for i in {1..6}; do
  curl -X POST http://localhost:5231/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"viewer@nikahsalon.local","password":"Viewer1!"}'
done
```

**Not:** Backend yeniden başlatıldıktan sonra test edilmeli.

### Test 2: Write Endpoint Rate Limiting
**Beklenen:** 20 request'ten sonra 429 dönmeli

```bash
# Editor token al
TOKEN=$(curl -s -X POST http://localhost:5231/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"editor@nikahsalon.local","password":"Editor1!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 21 ardışık create request'i
for i in {1..21}; do
  curl -X POST http://localhost:5231/api/v1/halls \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","address":"Test","capacity":100,"description":"","imageUrl":""}'
done
```

---

## 🔍 HTTP 429 Response Format

Limit aşıldığında dönen response:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errors": []
}
```

**HTTP Status:** 429 Too Many Requests

---

## ⚙️ Yapılandırma Detayları

### Program.cs Yapılandırması

```csharp
builder.Services.AddRateLimiter(options =>
{
    // Global default: 100 req/min
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(...);
    
    // Login: 5 req/min
    options.AddPolicy("LoginPolicy", ...);
    
    // Write endpoints: 20 req/min
    options.AddPolicy("WritePolicy", ...);
    
    // 429 response handler
    options.OnRejected = async (context, cancellationToken) => { ... };
});
```

### Middleware Sırası

```csharp
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors();
app.UseHttpsRedirection();
app.UseRateLimiter();  // ← Rate limiting middleware
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

---

## 📝 Notlar

1. **IP-Based Partitioning:** Rate limiting IP adresine göre yapılıyor
2. **Queue Support:** Limit aşıldığında request'ler queue'ya alınıyor
3. **Window:** Fixed window rate limiting kullanılıyor (1 dakika)
4. **Backend Restart:** Rate limiting'in aktif olması için backend'in yeniden başlatılması gerekiyor

---

## ✅ Sonuç

Rate limiting başarıyla yapılandırıldı:
- ✅ Global policy: 100 req/min
- ✅ Login policy: 5 req/min
- ✅ Write policy: 20 req/min
- ✅ HTTP 429 response handler
- ✅ Controller'lara attribute'lar eklendi
- ✅ Build başarılı

**Not:** Production'da limit değerleri `appsettings.Production.json` veya environment variables ile yapılandırılabilir.
