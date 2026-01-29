using Microsoft.EntityFrameworkCore;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Infrastructure.Data;

namespace NikahSalon.Infrastructure.Repositories;

public sealed class WeddingHallRepository : IWeddingHallRepository
{
    private readonly AppDbContext _db;

    public WeddingHallRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<WeddingHall?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.WeddingHalls.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IReadOnlyList<WeddingHall>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.WeddingHalls.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<WeddingHall>> GetByCenterIdAsync(Guid centerId, CancellationToken ct = default)
    {
        return await _db.WeddingHalls.AsNoTracking()
            .Where(x => x.CenterId == centerId)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);
    }

    public async Task<(IReadOnlyList<WeddingHall> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, CancellationToken ct = default)
    {
        var query = _db.WeddingHalls.AsNoTracking();

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLowerInvariant();
            query = query.Where(x => 
                x.Name.ToLower().Contains(searchLower) ||
                x.Address.ToLower().Contains(searchLower) ||
                x.Description.ToLower().Contains(searchLower));
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync(ct);

        // Apply pagination and ordering
        var items = await query
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<WeddingHall> AddAsync(WeddingHall entity, CancellationToken ct = default)
    {
        _db.WeddingHalls.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task UpdateAsync(WeddingHall entity, CancellationToken ct = default)
    {
        _db.WeddingHalls.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.WeddingHalls.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity == null)
            return false;

        _db.WeddingHalls.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<int> GetTotalCountAsync(CancellationToken ct = default)
    {
        return await _db.WeddingHalls.CountAsync(ct);
    }
}
