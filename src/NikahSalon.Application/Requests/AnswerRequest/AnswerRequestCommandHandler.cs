using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Requests.AnswerRequest;

public sealed class AnswerRequestCommandHandler
{
    private readonly IRequestRepository _repository;

    public AnswerRequestCommandHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<RequestDto?> HandleAsync(AnswerRequestCommand command, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdForUpdateAsync(command.Id, ct);
        if (entity is null) return null;
        if (entity.Status != RequestStatus.Pending)
            throw new InvalidOperationException("Only Pending requests can be marked as Answered.");

        entity.Status = RequestStatus.Answered;
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
