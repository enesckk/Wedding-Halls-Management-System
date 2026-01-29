using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Users.CreateUser;

public sealed class CreateUserCommand
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public required string FullName { get; init; }
    public required string Role { get; init; }
    /// <summary>
    /// Editor'lar için alan/departman (Nikah, Nişan, Konser, vb.). SuperAdmin ve Viewer için null.
    /// </summary>
    public EventType? Department { get; init; }
}
