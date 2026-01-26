namespace NikahSalon.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(Guid userId, string email, string role);
}
