using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Schedules.GetScheduleById;

public sealed class GetScheduleByIdQueryHandler
{
    private readonly IScheduleRepository _repository;

    public GetScheduleByIdQueryHandler(IScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<ScheduleDto?> HandleAsync(GetScheduleByIdQuery query, CancellationToken ct = default)
    {
        var schedule = await _repository.GetByIdAsync(query.Id, ct);
        if (schedule == null)
            return null;

        return new ScheduleDto
        {
            Id = schedule.Id,
            WeddingHallId = schedule.WeddingHallId,
            Date = schedule.Date,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            Status = schedule.Status,
            CreatedByUserId = schedule.CreatedByUserId,
            EventType = schedule.EventType,
            EventName = schedule.EventName,
            EventOwner = schedule.EventOwner
        };
    }
}
