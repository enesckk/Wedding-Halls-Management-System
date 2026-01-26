namespace NikahSalon.Application.Common;

public sealed class LoginResult
{
    public bool Success { get; init; }
    public string? Token { get; init; }
    public Guid? UserId { get; init; }
    public string? Email { get; init; }
    public string? Role { get; init; }
    public string? Message { get; init; }
}
