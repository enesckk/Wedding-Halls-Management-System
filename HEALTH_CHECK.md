# Health Check Endpoint

**Tarih:** 2026-01-23  
**Endpoint:** `GET /api/v1/health`

---

## ✅ Endpoint Detayları

| Özellik | Değer |
|---------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/health` |
| **Authentication** | ❌ Gerekmez (`[AllowAnonymous]`) |
| **Response Code** | `200 OK` |
| **Response Format** | JSON |

---

## 📋 Response Format

```json
{
  "status": "Healthy",
  "timestamp": "2026-01-26T06:20:34.877311Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | Her zaman `"Healthy"` |
| `timestamp` | `DateTime` | UTC timestamp (ISO 8601 format) |

---

## 📁 Dosya Yapısı

```
src/NikahSalon.API/
  ├── Controllers/
  │   └── HealthController.cs  ← Yeni eklendi
  └── Models/
      └── HealthResponse.cs    ← Yeni eklendi
```

---

## 🔍 Test

### cURL

```bash
curl -X GET http://localhost:5230/api/v1/health
```

**Response:**
```json
{
  "status": "Healthy",
  "timestamp": "2026-01-26T06:20:34.877311Z"
}
```

### Browser

```
http://localhost:5230/api/v1/health
```

---

## ⚙️ Implementation Details

### HealthController.cs

```csharp
[ApiController]
[Route("api/v1/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new HealthResponse
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow
        });
    }
}
```

### HealthResponse.cs

```csharp
public sealed record HealthResponse
{
    public required string Status { get; init; }
    public required DateTime Timestamp { get; init; }
}
```

---

## ✅ Özellikler

- ✅ **Hafif:** Database'e dokunmaz, sadece basit bir response döner
- ✅ **Hızlı:** Minimum overhead
- ✅ **Public:** Authentication gerektirmez
- ✅ **Minimal:** Gereksiz bilgi içermez
- ✅ **Versioned:** `/api/v1` altında

---

## 📝 Notlar

1. **Database Check Yok:** Bu endpoint database bağlantısını kontrol etmez. Sadece API'nin çalıştığını gösterir.
2. **Internal Info Yok:** Sistem detayları, versiyon bilgisi veya internal state bilgisi döndürülmez.
3. **Production Ready:** Load balancer'lar ve monitoring sistemleri için uygundur.

---

## ✅ Sonuç

Health check endpoint başarıyla eklendi:
- ✅ Endpoint oluşturuldu: `GET /api/v1/health`
- ✅ Authentication gerektirmiyor
- ✅ HTTP 200 döndürüyor
- ✅ JSON format doğru
- ✅ Timestamp UTC formatında
- ✅ Build başarılı
- ✅ Test başarılı
