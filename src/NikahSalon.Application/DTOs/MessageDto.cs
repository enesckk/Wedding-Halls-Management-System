namespace NikahSalon.Application.DTOs;

public sealed class MessageDto
{
    public Guid Id { get; init; }
    public Guid RequestId { get; init; }
    public Guid SenderUserId { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}
