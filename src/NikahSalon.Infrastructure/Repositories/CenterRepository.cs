using Microsoft.EntityFrameworkCore;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Infrastructure.Data;

namespace NikahSalon.Infrastructure.Repositories;

public sealed class CenterRepository : ICenterRepository
{
    private readonly AppDbContext _db;

    public CenterRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Center?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Centers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IReadOnlyList<Center>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Centers.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);
    }

    public async Task<Center> AddAsync(Center entity, CancellationToken ct = default)
    {
        _db.Centers.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task UpdateAsync(Center entity, CancellationToken ct = default)
    {
        _db.Centers.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.Centers.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity == null)
            return false;

        _db.Centers.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
