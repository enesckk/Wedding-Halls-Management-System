using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.UpdateSchedule;

public sealed class UpdateScheduleCommand
{
    public Guid Id { get; init; }
    public Guid WeddingHallId { get; init; }
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public ScheduleStatus Status { get; init; }
    /// <summary>
    /// Etkinlik tipi (Dolu schedule'lar için)
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
    /// İşlemi yapan kullanıcı ID'si
    /// </summary>
    public Guid? CallerUserId { get; init; }
    /// <summary>
    /// İşlemi yapan kullanıcının rolü (SuperAdmin tüm schedule'ları güncelleyebilir)
    /// </summary>
    public string? CallerRole { get; init; }
    /// <summary>
    /// Editor'ın alanı/departmanı (Editor sadece kendi alanındaki schedule'ları güncelleyebilir)
    /// </summary>
    public EventType? CallerDepartment { get; init; }
}
