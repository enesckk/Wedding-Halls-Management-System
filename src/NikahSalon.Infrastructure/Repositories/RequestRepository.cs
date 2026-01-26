using Microsoft.EntityFrameworkCore;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Infrastructure.Data;

namespace NikahSalon.Infrastructure.Repositories;

public sealed class RequestRepository : IRequestRepository
{
    private readonly AppDbContext _db;

    public RequestRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Request?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Requests.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<Request?> GetByIdForUpdateAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Requests.FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IReadOnlyList<Request>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Requests.AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Request> AddAsync(Request entity, CancellationToken ct = default)
    {
        _db.Requests.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task UpdateAsync(Request entity, CancellationToken ct = default)
    {
        _db.Requests.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
