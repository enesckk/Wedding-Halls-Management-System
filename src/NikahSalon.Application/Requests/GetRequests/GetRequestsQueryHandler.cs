using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Requests.GetRequests;

public sealed class GetRequestsQueryHandler
{
    private readonly IRequestRepository _repository;

    public GetRequestsQueryHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<RequestDto>> HandleAsync(GetRequestsQuery query, CancellationToken ct = default)
    {
        var items = await _repository.GetAllAsync(ct);
        return items.Select(r => new RequestDto
        {
            Id = r.Id,
            WeddingHallId = r.WeddingHallId,
            CreatedByUserId = r.CreatedByUserId,
            Message = r.Message,
            Status = r.Status,
            CreatedAt = r.CreatedAt,
            EventType = r.EventType,
            EventName = r.EventName,
            EventOwner = r.EventOwner,
            EventDate = r.EventDate,
            EventTime = r.EventTime
        }).ToList();
    }
}
