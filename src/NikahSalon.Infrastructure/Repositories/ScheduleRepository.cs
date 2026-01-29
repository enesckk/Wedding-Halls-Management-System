using Microsoft.EntityFrameworkCore;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Domain.Enums;
using NikahSalon.Infrastructure.Data;

namespace NikahSalon.Infrastructure.Repositories;

public sealed class ScheduleRepository : IScheduleRepository
{
    private readonly AppDbContext _db;

    public ScheduleRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Schedule?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Schedules.FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IReadOnlyList<Schedule>> GetByHallIdAsync(Guid hallId, CancellationToken ct = default)
    {
        return await GetByHallIdAsync(hallId, null, null, ct);
    }

    public async Task<IReadOnlyList<Schedule>> GetByHallIdAsync(Guid hallId, Guid? createdByUserId, EventType? eventType, CancellationToken ct = default)
    {
        // Artık filtreleme yok - Editor'lar tüm schedule'ları görebilir
        // Düzenleme/silme yetkisi UpdateSchedule ve DeleteSchedule handler'larında kontrol ediliyor
        var query = _db.Schedules.AsNoTracking()
            .Where(x => x.WeddingHallId == hallId);

        return await query
            .OrderBy(x => x.Date).ThenBy(x => x.StartTime)
            .ToListAsync(ct);
    }

    public async Task<Schedule> AddAsync(Schedule entity, CancellationToken ct = default)
    {
        _db.Schedules.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task UpdateAsync(Schedule entity, CancellationToken ct = default)
    {
        _db.Schedules.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<bool> ExistsOverlapAsync(Guid hallId, DateOnly date, TimeOnly startTime, TimeOnly endTime, Guid? excludeScheduleId, CancellationToken ct = default)
    {
        var query = _db.Schedules
            .Where(x => x.WeddingHallId == hallId && x.Date == date)
            .Where(x => (startTime < x.EndTime && endTime > x.StartTime));

        if (excludeScheduleId.HasValue)
            query = query.Where(x => x.Id != excludeScheduleId.Value);

        return await query.AnyAsync(ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.Schedules.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity == null)
            return false;

        _db.Schedules.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<int> DeleteAllAsync(CancellationToken ct = default)
    {
        var allSchedules = await _db.Schedules.ToListAsync(ct);
        var count = allSchedules.Count;
        _db.Schedules.RemoveRange(allSchedules);
        await _db.SaveChangesAsync(ct);
        return count;
    }

    public async Task<int> GetTotalCountAsync(CancellationToken ct = default)
    {
        return await _db.Schedules.CountAsync(ct);
    }

    public async Task<int> GetCountByStatusAsync(ScheduleStatus status, CancellationToken ct = default)
    {
        return await _db.Schedules.CountAsync(x => x.Status == status, ct);
    }
}
