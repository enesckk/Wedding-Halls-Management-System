using NikahSalon.Domain.Enums;

namespace NikahSalon.Domain.Entities;

public class Request
{
    public Guid Id { get; set; }
    public Guid WeddingHallId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public RequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public EventType EventType { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string EventOwner { get; set; } = string.Empty;
    public DateOnly EventDate { get; set; }
    public TimeOnly EventTime { get; set; }
}
