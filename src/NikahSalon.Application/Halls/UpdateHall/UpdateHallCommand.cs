namespace NikahSalon.Application.Halls.UpdateHall;

public sealed class UpdateHallCommand
{
    public Guid Id { get; init; }
    public Guid CenterId { get; init; } // Merkez ID'si
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public string Description { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public string TechnicalDetails { get; init; } = string.Empty;
    /// <summary>Bu salona erişim hakkı olan Editor kullanıcı ID'leri</summary>
    public IReadOnlyList<Guid>? AllowedUserIds { get; init; }
}
