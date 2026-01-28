using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Requests.UpdateRequest;

public sealed class UpdateRequestCommand
{
    public Guid Id { get; init; }
    public Guid CallerUserId { get; init; }
    public string CallerRole { get; init; } = string.Empty; // "Viewer" | "Editor"

    public Guid WeddingHallId { get; init; }
    public string Message { get; init; } = string.Empty;
    public EventType EventType { get; init; }
    public string EventName { get; init; } = string.Empty;
    public string EventOwner { get; init; } = string.Empty;
    public DateOnly EventDate { get; init; }
    public TimeOnly EventTime { get; init; }
}

