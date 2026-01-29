using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Users.UpdateUser;

public sealed class UpdateUserCommand
{
    public required Guid Id { get; init; }
    public string? Email { get; init; }
    public string? FullName { get; init; }
    public string? Role { get; init; }
    /// <summary>
    /// Editor'lar için alan/departman (Nikah, Nişan, Konser, vb.). SuperAdmin ve Viewer için null.
    /// </summary>
    public EventType? Department { get; init; }
    public string? Phone { get; init; }
}
