using NikahSalon.Domain.Enums;

namespace NikahSalon.Domain.Entities;

public class Schedule
{
    public Guid Id { get; set; }
    public Guid WeddingHallId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ScheduleStatus Status { get; set; }
    /// <summary>
    /// Schedule'ı oluşturan kullanıcı ID'si (Editor için)
    /// </summary>
    public Guid? CreatedByUserId { get; set; }
    /// <summary>
    /// Etkinlik tipi (Nikah, Nişan, Konser, vb.)
    /// </summary>
    public EventType? EventType { get; set; }
    /// <summary>
    /// Etkinlik adı (Dolu schedule'lar için)
    /// </summary>
    public string? EventName { get; set; }
    /// <summary>
    /// Etkinlik sahibi/kişi adı (Dolu schedule'lar için)
    /// </summary>
    public string? EventOwner { get; set; }
}
