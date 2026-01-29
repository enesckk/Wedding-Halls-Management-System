namespace NikahSalon.Application.Centers.UpdateCenter;

public sealed class UpdateCenterCommand
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
}
