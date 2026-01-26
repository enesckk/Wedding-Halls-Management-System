using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Requests.CreateRequest;

public sealed class CreateRequestCommand
{
    public Guid WeddingHallId { get; init; }
    public Guid CreatedByUserId { get; init; }
    public string Message { get; init; } = string.Empty;
    public EventType EventType { get; init; }
    public string EventName { get; init; } = string.Empty;
    public string EventOwner { get; init; } = string.Empty;
    public DateOnly EventDate { get; init; }
    public TimeOnly EventTime { get; init; }
}
