using NikahSalon.Application.Common;

namespace NikahSalon.Application.Interfaces;

public interface IUserRepository
{
    Task<UserInfo?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserInfo?> GetByEmailAsync(string email, CancellationToken ct = default);
}
