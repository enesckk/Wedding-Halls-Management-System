using NikahSalon.Application.Common;

namespace NikahSalon.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResult> LoginAsync(string email, string password, CancellationToken ct = default);
}
