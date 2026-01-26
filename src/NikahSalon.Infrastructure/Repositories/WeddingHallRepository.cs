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
}
