using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Interfaces;

public interface IWeddingHallRepository
{
    Task<WeddingHall?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<WeddingHall>> GetAllAsync(CancellationToken ct = default);
    Task<(IReadOnlyList<WeddingHall> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, CancellationToken ct = default);
    Task<WeddingHall> AddAsync(WeddingHall entity, CancellationToken ct = default);
    Task UpdateAsync(WeddingHall entity, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<int> GetTotalCountAsync(CancellationToken ct = default);
}
