using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Requests.UpdateRequest;

public sealed class UpdateRequestCommandHandler
{
    private readonly IRequestRepository _repository;

    public UpdateRequestCommandHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<RequestDto?> HandleAsync(UpdateRequestCommand command, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdForUpdateAsync(command.Id, ct);
        if (entity is null) return null;

        // Viewer can only update Pending requests and only their own requests
        if (string.Equals(command.CallerRole, "Viewer", StringComparison.OrdinalIgnoreCase))
        {
            if (entity.Status != RequestStatus.Pending)
                throw new InvalidOperationException("Sadece bekleyen talepler düzenlenebilir.");
            
            if (entity.CreatedByUserId != command.CallerUserId)
                throw new UnauthorizedAccessException("Sadece kendi taleplerinizi düzenleyebilirsiniz.");
        }
        // Editor can update requests in any status

        entity.WeddingHallId = command.WeddingHallId;
        entity.Message = command.Message ?? string.Empty;
        entity.EventType = command.EventType;
        entity.EventName = command.EventName;
        entity.EventOwner = command.EventOwner;
        entity.EventDate = command.EventDate;
        entity.EventTime = command.EventTime;

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

