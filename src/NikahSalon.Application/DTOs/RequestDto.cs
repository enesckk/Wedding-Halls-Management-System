using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.DTOs;

public sealed class RequestDto
{
    public Guid Id { get; init; }
    public Guid WeddingHallId { get; init; }
    public Guid CreatedByUserId { get; init; }
    public string Message { get; init; } = string.Empty;
    public RequestStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
    public EventType EventType { get; init; }
    public string EventName { get; init; } = string.Empty;
    public string EventOwner { get; init; } = string.Empty;
    public DateOnly EventDate { get; init; }
    public TimeOnly EventTime { get; init; }
}
