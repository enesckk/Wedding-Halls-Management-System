namespace NikahSalon.Application.Halls.DeleteHall;

public sealed record DeleteHallCommand
{
    public required Guid Id { get; init; }
}
