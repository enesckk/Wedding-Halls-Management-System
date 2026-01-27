namespace NikahSalon.Application.Requests.DeleteRequest;

public sealed record DeleteRequestCommand
{
    public required Guid Id { get; init; }
}
