using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Common;

public sealed class UserInfo
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    /// <summary>
    /// Editor'lar için alan/departman (Nikah, Nişan, Konser, vb.). SuperAdmin ve Viewer için null.
    /// </summary>
    public EventType? Department { get; init; }
    public string? Phone { get; init; }
}
