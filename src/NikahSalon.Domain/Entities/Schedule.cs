using NikahSalon.Domain.Enums;

namespace NikahSalon.Domain.Entities;

public class Schedule
{
    public Guid Id { get; set; }
    public Guid WeddingHallId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ScheduleStatus Status { get; set; }
}
