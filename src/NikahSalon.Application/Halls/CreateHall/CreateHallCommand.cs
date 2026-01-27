namespace NikahSalon.Application.Halls.CreateHall;

public sealed class CreateHallCommand
{
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public string Description { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public string TechnicalDetails { get; init; } = string.Empty;
    /// <summary>İzin verilen başlangıç saatleri (örn. 09:00, 10:30). Verilirse bu slotlar için önümüzdeki 30 gün müsaitlik oluşturulur.</summary>
    public IReadOnlyList<string>? TimeSlots { get; init; }
}
