using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Requests.RejectRequest;

public sealed class RejectRequestCommandHandler
{
    private readonly IRequestRepository _repository;

    public RejectRequestCommandHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<RequestDto?> HandleAsync(RejectRequestCommand command, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdForUpdateAsync(command.Id, ct);
        if (entity is null) return null;
        if (entity.Status != RequestStatus.Pending)
            throw new InvalidOperationException("Sadece bekleyen talepler reddedilebilir.");

        entity.Status = RequestStatus.Rejected;
        
        // Reddetme sebebini mesaj olarak ekle
        if (!string.IsNullOrWhiteSpace(command.Reason))
        {
            var reasonMessage = $"[REDDEDİLDİ] Sebep: {command.Reason}";
            entity.Message = string.IsNullOrWhiteSpace(entity.Message) 
                ? reasonMessage 
                : $"{entity.Message}\n\n{reasonMessage}";
        }
        
        await _repository.UpdateAsync(entity, ct);

        return new RequestDto
        {
            Id = entity.Id,
            WeddingHallId = entity.WeddingHallId,
            CreatedByUserId = entity.CreatedByUserId,
            Message = entity.Message,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
            EventType = entity.EventType,
            EventName = entity.EventName,
            EventOwner = entity.EventOwner,
            EventDate = entity.EventDate,
            EventTime = entity.EventTime
        };
    }
}
