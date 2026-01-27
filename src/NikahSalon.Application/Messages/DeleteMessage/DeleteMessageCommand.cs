namespace NikahSalon.Application.Messages.DeleteMessage;

public sealed record DeleteMessageCommand
{
    public required Guid Id { get; init; }
    public required Guid RequestId { get; init; }
}
