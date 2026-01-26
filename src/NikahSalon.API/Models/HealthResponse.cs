namespace NikahSalon.API.Models;

public sealed record HealthResponse
{
    public required string Status { get; init; }
    public required DateTime Timestamp { get; init; }
}
