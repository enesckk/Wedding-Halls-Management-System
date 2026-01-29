using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Schedules.GetSchedulesByHall;

public sealed class GetSchedulesByHallQueryHandler
{
    private readonly IScheduleRepository _repository;

    public GetSchedulesByHallQueryHandler(IScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<ScheduleDto>> HandleAsync(GetSchedulesByHallQuery query, CancellationToken ct = default)
    {
        var items = await _repository.GetByHallIdAsync(query.HallId, query.CreatedByUserId, query.EventType, ct);
        return items.Select(s => new ScheduleDto
        {
            Id = s.Id,
            WeddingHallId = s.WeddingHallId,
            Date = s.Date,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            Status = s.Status,
            CreatedByUserId = s.CreatedByUserId,
            EventType = s.EventType,
            EventName = s.EventName,
            EventOwner = s.EventOwner
        }).ToList();
    }
}
