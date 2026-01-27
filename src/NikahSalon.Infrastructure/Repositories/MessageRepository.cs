using Microsoft.EntityFrameworkCore;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Infrastructure.Data;

namespace NikahSalon.Infrastructure.Repositories;

public sealed class MessageRepository : IMessageRepository
{
    private readonly AppDbContext _db;

    public MessageRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Message> AddAsync(Message entity, CancellationToken ct = default)
    {
        _db.Messages.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<IReadOnlyList<Message>> GetByRequestIdAsync(Guid requestId, CancellationToken ct = default)
    {
        return await _db.Messages.AsNoTracking()
            .Where(x => x.RequestId == requestId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Message?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Messages.FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.Messages.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity == null)
            return false;

        _db.Messages.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
