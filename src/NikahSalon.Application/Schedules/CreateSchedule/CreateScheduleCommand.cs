using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.CreateSchedule;

public sealed class CreateScheduleCommand
{
    public Guid WeddingHallId { get; init; }
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public ScheduleStatus Status { get; init; }
    /// <summary>
    /// Schedule'ı oluşturan kullanıcı ID'si (Editor için)
    /// </summary>
    public Guid? CreatedByUserId { get; init; }
    /// <summary>
    /// Etkinlik tipi (Editor'ın alanına göre)
    /// </summary>
    public EventType? EventType { get; init; }
    /// <summary>
    /// Etkinlik adı (Dolu schedule'lar için)
    /// </summary>
    public string? EventName { get; init; }
    /// <summary>
    /// Etkinlik sahibi/kişi adı (Dolu schedule'lar için)
    /// </summary>
    public string? EventOwner { get; init; }
    /// <summary>
    /// İşlemi yapan kullanıcı ID'si (erişim kontrolü için)
    /// </summary>
    public Guid? CallerUserId { get; init; }
    /// <summary>
    /// İşlemi yapan kullanıcının rolü (erişim kontrolü için)
    /// </summary>
    public string? CallerRole { get; init; }
}
