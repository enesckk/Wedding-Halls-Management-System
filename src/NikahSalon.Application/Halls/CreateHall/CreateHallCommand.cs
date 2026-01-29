namespace NikahSalon.Application.Halls.CreateHall;

public sealed class CreateHallCommand
{
    public Guid CenterId { get; init; } // Merkez ID'si
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public string Description { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public string TechnicalDetails { get; init; } = string.Empty;
    /// <summary>İzin verilen başlangıç saatleri (örn. 09:00, 10:30). Verilirse bu slotlar için önümüzdeki 30 gün müsaitlik oluşturulur.</summary>
    public IReadOnlyList<string>? TimeSlots { get; init; }
    /// <summary>Bu salona erişim hakkı olan Editor kullanıcı ID'leri</summary>
    public IReadOnlyList<Guid>? AllowedUserIds { get; init; }
}
