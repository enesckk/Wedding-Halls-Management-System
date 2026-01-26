using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Interfaces;

public interface IMessageRepository
{
    Task<Message> AddAsync(Message entity, CancellationToken ct = default);
    Task<IReadOnlyList<Message>> GetByRequestIdAsync(Guid requestId, CancellationToken ct = default);
}
