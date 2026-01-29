using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Interfaces;

public interface IHallAccessRepository
{
    Task AddAsync(HallAccess entity, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<HallAccess> entities, CancellationToken ct = default);
    Task<bool> HasAccessAsync(Guid hallId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<Guid>> GetAccessibleHallIdsAsync(Guid userId, CancellationToken ct = default);
    Task RemoveByHallIdAsync(Guid hallId, CancellationToken ct = default);
}
