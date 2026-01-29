using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.DeleteSchedule;

public sealed record DeleteScheduleCommand
{
    public required Guid Id { get; init; }
    /// <summary>
    /// İşlemi yapan kullanıcı ID'si
    /// </summary>
    public Guid? CallerUserId { get; init; }
    /// <summary>
    /// İşlemi yapan kullanıcının rolü (SuperAdmin tüm schedule'ları silebilir)
    /// </summary>
    public string? CallerRole { get; init; }
    /// <summary>
    /// Editor'ın alanı/departmanı (Editor sadece kendi alanındaki schedule'ları silebilir)
    /// </summary>
    public EventType? CallerDepartment { get; init; }
}
