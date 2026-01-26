using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Interfaces;

public interface IRequestRepository
{
    Task<Request?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Request?> GetByIdForUpdateAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Request>> GetAllAsync(CancellationToken ct = default);
    Task<Request> AddAsync(Request entity, CancellationToken ct = default);
    Task UpdateAsync(Request entity, CancellationToken ct = default);
}
