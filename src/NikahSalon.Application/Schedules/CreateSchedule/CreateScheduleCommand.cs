using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.CreateSchedule;

public sealed class CreateScheduleCommand
{
    public Guid WeddingHallId { get; init; }
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public ScheduleStatus Status { get; init; }
}
