using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.UpdateSchedule;

public sealed class UpdateScheduleCommand
{
    public Guid Id { get; init; }
    public Guid WeddingHallId { get; init; }
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public ScheduleStatus Status { get; init; }
}
