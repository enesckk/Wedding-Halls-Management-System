using NikahSalon.Application.Common;

namespace NikahSalon.Application.Interfaces;

public interface IUserRepository
{
    Task<UserInfo?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserInfo?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<(IReadOnlyList<UserInfo> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, CancellationToken ct = default);
    Task<UserInfo> CreateAsync(string email, string password, string fullName, string role, CancellationToken ct = default);
    Task<UserInfo?> UpdateAsync(Guid id, string? email, string? fullName, string? role, CancellationToken ct = default);
}
