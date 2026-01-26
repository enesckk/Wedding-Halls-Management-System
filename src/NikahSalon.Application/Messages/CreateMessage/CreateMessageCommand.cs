namespace NikahSalon.Application.Messages.CreateMessage;

public sealed class CreateMessageCommand
{
    public Guid RequestId { get; init; }
    public Guid SenderUserId { get; init; }
    public string Content { get; init; } = string.Empty;
}
