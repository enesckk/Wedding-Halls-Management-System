using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.DTOs;

public sealed class ScheduleDto
{
    public Guid Id { get; init; }
    public Guid WeddingHallId { get; init; }
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public ScheduleStatus Status { get; init; }
}
