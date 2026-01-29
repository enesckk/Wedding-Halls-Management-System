using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Interfaces;

public interface ICenterRepository
{
    Task<Center?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Center>> GetAllAsync(CancellationToken ct = default);
    Task<Center> AddAsync(Center entity, CancellationToken ct = default);
    Task UpdateAsync(Center entity, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
