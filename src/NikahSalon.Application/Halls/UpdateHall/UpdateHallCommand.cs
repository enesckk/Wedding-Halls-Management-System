namespace NikahSalon.Application.Halls.UpdateHall;

public sealed class UpdateHallCommand
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public string Description { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public string TechnicalDetails { get; init; } = string.Empty;
}
