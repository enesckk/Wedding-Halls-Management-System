namespace NikahSalon.Application.Requests.RejectRequest;

public sealed class RejectRequestCommand
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string CallerRole { get; init; } = string.Empty; // "Viewer" | "Editor"
}
