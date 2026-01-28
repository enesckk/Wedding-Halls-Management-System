# Backend Update Endpoint Ekleme Rehberi

Bu dosya, backend'de talep güncelleme endpoint'ini nasıl ekleyeceğinizi açıklar.

## 📍 Backend Konumu

Backend projesi genellikle şu konumlardan birinde bulunur:
- `../wedding-hall-api`
- `/Users/enescikcik/Desktop/wedding-hall-api` (macOS)
- `C:\Users\...\wedding-hall-api` (Windows)

## 🔧 Eklenmesi Gereken Endpoint

**Endpoint:** `PUT /api/v1/requests/{id}/update`

**Controller:** `RequestsController.cs`

## 📝 Kod Örneği

`RequestsController.cs` dosyasına aşağıdaki metodu ekleyin:

```csharp
/// <summary>
/// Talebi günceller (sadece Pending durumundaki talepler için)
/// </summary>
[HttpPut("{id}/update")]
[Authorize]
public async Task<ActionResult<RequestDto>> UpdateRequest(
    Guid id,
    [FromBody] UpdateRequestDto dto)
{
    try
    {
        // Kullanıcı bilgisini al
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("Kullanıcı bilgisi bulunamadı.");
        }

        // Mevcut talebi bul
        var request = await _context.Requests
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound("Talep bulunamadı.");
        }

        // Sadece Pending durumundaki talepler güncellenebilir
        if (request.Status != RequestStatus.Pending)
        {
            return BadRequest("Sadece bekleyen talepler düzenlenebilir.");
        }

        // Viewer sadece kendi taleplerini güncelleyebilir
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == "Viewer" && request.CreatedByUserId.ToString() != userId)
        {
            return Forbid("Sadece kendi taleplerinizi düzenleyebilirsiniz.");
        }

        // Talep bilgilerini güncelle
        if (!string.IsNullOrEmpty(dto.EventName))
            request.EventName = dto.EventName;
        
        if (!string.IsNullOrEmpty(dto.EventOwner))
            request.EventOwner = dto.EventOwner;
        
        if (dto.EventType.HasValue)
            request.EventType = dto.EventType.Value;
        
        if (!string.IsNullOrEmpty(dto.EventDate))
            request.EventDate = DateTime.Parse(dto.EventDate);
        
        if (!string.IsNullOrEmpty(dto.EventTime))
            request.EventTime = TimeSpan.Parse(dto.EventTime);
        
        if (dto.WeddingHallId.HasValue)
            request.WeddingHallId = dto.WeddingHallId.Value;
        
        if (dto.Message != null)
            request.Message = dto.Message;

        // Değişiklikleri kaydet
        await _context.SaveChangesAsync();

        // Güncellenmiş talebi döndür
        var updatedRequest = await _context.Requests
            .Include(r => r.WeddingHall)
            .FirstOrDefaultAsync(r => r.Id == id);

        return Ok(MapToDto(updatedRequest));
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Talep güncelleme hatası: {RequestId}", id);
        return StatusCode(500, "Talep güncellenirken bir hata oluştu.");
    }
}
```

## 📋 DTO Sınıfı

`UpdateRequestDto` sınıfını ekleyin (veya mevcut DTO'yu kullanın):

```csharp
public class UpdateRequestDto
{
    public Guid? WeddingHallId { get; set; }
    public string? EventName { get; set; }
    public string? EventOwner { get; set; }
    public int? EventType { get; set; }
    public string? EventDate { get; set; }
    public string? EventTime { get; set; }
    public string? Message { get; set; }
}
```

## ✅ Alternatif: PATCH Metodu

Eğer `/update` endpoint'i yerine direkt `PUT /api/v1/requests/{id}` veya `PATCH /api/v1/requests/{id}` kullanmak isterseniz:

```csharp
[HttpPut("{id}")]
[HttpPatch("{id}")]
[Authorize]
public async Task<ActionResult<RequestDto>> UpdateRequest(
    Guid id,
    [FromBody] UpdateRequestDto dto)
{
    // Yukarıdaki kodun aynısı
}
```

## 🔒 Güvenlik Notları

1. **Yetkilendirme:** Sadece giriş yapmış kullanıcılar talebi güncelleyebilir
2. **Rol Kontrolü:** Viewer sadece kendi taleplerini güncelleyebilir
3. **Durum Kontrolü:** Sadece Pending durumundaki talepler güncellenebilir
4. **Validasyon:** Tüm gelen veriler validate edilmelidir

## 🧪 Test

Endpoint'i test etmek için:

```bash
curl -X PUT "http://localhost:5230/api/v1/requests/{id}/update" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Güncellenmiş Etkinlik Adı",
    "eventOwner": "Güncellenmiş Sahip",
    "eventType": 0,
    "eventDate": "2026-02-15",
    "eventTime": "14:00",
    "message": "Güncellenmiş mesaj"
  }'
```

## 📝 Notlar

- Bu endpoint, mevcut `approve` ve `reject` endpoint'leriyle aynı pattern'i takip eder
- Frontend kodunda geçici çözüm (sil-yeniden-oluştur) bu endpoint eklendikten sonra otomatik olarak devre dışı kalacak
- Backend'de bu endpoint eklendikten sonra frontend'deki geçici çözüm kaldırılabilir
