namespace NikahSalon.Application.Users.UpdateUser;

public sealed class UpdateUserCommand
{
    public required Guid Id { get; init; }
    public string? Email { get; init; }
    public string? FullName { get; init; }
    public string? Role { get; init; }
}
