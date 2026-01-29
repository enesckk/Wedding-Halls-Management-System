namespace NikahSalon.Application.Centers.CreateCenter;

public sealed class CreateCenterCommand
{
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
}
