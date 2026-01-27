using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Interfaces;

public interface IMessageRepository
{
    Task<Message?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Message> AddAsync(Message entity, CancellationToken ct = default);
    Task<IReadOnlyList<Message>> GetByRequestIdAsync(Guid requestId, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
