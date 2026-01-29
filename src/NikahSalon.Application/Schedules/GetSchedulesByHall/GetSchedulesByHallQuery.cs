using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.GetSchedulesByHall;

public sealed class GetSchedulesByHallQuery
{
    public Guid HallId { get; init; }
    /// <summary>
    /// Editor için: Sadece bu kullanıcının oluşturduğu schedule'ları getir
    /// </summary>
    public Guid? CreatedByUserId { get; init; }
    /// <summary>
    /// Editor için: Sadece bu event type'ındaki schedule'ları getir
    /// </summary>
    public EventType? EventType { get; init; }
}
