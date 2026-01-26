using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Requests.CreateRequest;

public sealed class CreateRequestCommandHandler
{
    private readonly IRequestRepository _repository;

    public CreateRequestCommandHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<RequestDto> HandleAsync(CreateRequestCommand command, CancellationToken ct = default)
    {
        var entity = new Request
        {
            Id = Guid.NewGuid(),
            WeddingHallId = command.WeddingHallId,
            CreatedByUserId = command.CreatedByUserId,
            Message = command.Message,
            Status = RequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            EventType = command.EventType,
            EventName = command.EventName,
            EventOwner = command.EventOwner,
            EventDate = command.EventDate,
            EventTime = command.EventTime
        };
        var created = await _repository.AddAsync(entity, ct);
        return new RequestDto
        {
            Id = created.Id,
            WeddingHallId = created.WeddingHallId,
            CreatedByUserId = created.CreatedByUserId,
            Message = created.Message,
            Status = created.Status,
            CreatedAt = created.CreatedAt,
            EventType = created.EventType,
            EventName = created.EventName,
            EventOwner = created.EventOwner,
            EventDate = created.EventDate,
            EventTime = created.EventTime
        };
    }
}
