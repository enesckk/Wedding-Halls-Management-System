namespace NikahSalon.Application.Schedules.DeleteSchedule;

public sealed record DeleteScheduleCommand
{
    public required Guid Id { get; init; }
}
