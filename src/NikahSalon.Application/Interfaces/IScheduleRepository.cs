using NikahSalon.Domain.Entities;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Interfaces;

public interface IScheduleRepository
{
    Task<Schedule?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Schedule>> GetByHallIdAsync(Guid hallId, CancellationToken ct = default);
    Task<IReadOnlyList<Schedule>> GetByHallIdAsync(Guid hallId, Guid? createdByUserId, EventType? eventType, CancellationToken ct = default);
    Task<Schedule> AddAsync(Schedule entity, CancellationToken ct = default);
    Task UpdateAsync(Schedule entity, CancellationToken ct = default);
    Task<bool> ExistsOverlapAsync(Guid hallId, DateOnly date, TimeOnly startTime, TimeOnly endTime, Guid? excludeScheduleId, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<int> DeleteAllAsync(CancellationToken ct = default);
    Task<int> GetTotalCountAsync(CancellationToken ct = default);
    Task<int> GetCountByStatusAsync(ScheduleStatus status, CancellationToken ct = default);
}
