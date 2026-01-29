using Microsoft.EntityFrameworkCore;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Infrastructure.Data;

namespace NikahSalon.Infrastructure.Repositories;

public sealed class HallAccessRepository : IHallAccessRepository
{
    private readonly AppDbContext _db;

    public HallAccessRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(HallAccess entity, CancellationToken ct = default)
    {
        _db.HallAccesses.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task AddRangeAsync(IEnumerable<HallAccess> entities, CancellationToken ct = default)
    {
        _db.HallAccesses.AddRange(entities);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<bool> HasAccessAsync(Guid hallId, Guid userId, CancellationToken ct = default)
    {
        return await _db.HallAccesses
            .AsNoTracking()
            .AnyAsync(x => x.HallId == hallId && x.UserId == userId, ct);
    }

    public async Task<IReadOnlyList<Guid>> GetAccessibleHallIdsAsync(Guid userId, CancellationToken ct = default)
    {
        return await _db.HallAccesses
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => x.HallId)
            .ToListAsync(ct);
    }

    public async Task RemoveByHallIdAsync(Guid hallId, CancellationToken ct = default)
    {
        var accesses = await _db.HallAccesses
            .Where(x => x.HallId == hallId)
            .ToListAsync(ct);
        
        if (accesses.Any())
        {
            _db.HallAccesses.RemoveRange(accesses);
            await _db.SaveChangesAsync(ct);
        }
    }
}
