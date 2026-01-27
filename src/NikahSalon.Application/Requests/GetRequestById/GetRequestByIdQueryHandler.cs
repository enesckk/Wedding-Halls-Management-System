using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Requests.GetRequestById;

public sealed class GetRequestByIdQueryHandler
{
    private readonly IRequestRepository _repository;

    public GetRequestByIdQueryHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<RequestDto?> HandleAsync(GetRequestByIdQuery query, CancellationToken ct = default)
    {
        var request = await _repository.GetByIdAsync(query.Id, ct);
        if (request == null)
            return null;

        return new RequestDto
        {
            Id = request.Id,
            WeddingHallId = request.WeddingHallId,
            CreatedByUserId = request.CreatedByUserId,
            Message = request.Message,
            Status = request.Status,
            CreatedAt = request.CreatedAt,
            EventType = request.EventType,
            EventName = request.EventName,
            EventOwner = request.EventOwner,
            EventDate = request.EventDate,
            EventTime = request.EventTime
        };
    }
}
