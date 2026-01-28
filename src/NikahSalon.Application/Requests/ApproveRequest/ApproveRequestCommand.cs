namespace NikahSalon.Application.Requests.ApproveRequest;

public sealed class ApproveRequestCommand
{
    public Guid Id { get; init; }
    public string CallerRole { get; init; } = string.Empty; // "Viewer" | "Editor"
}
