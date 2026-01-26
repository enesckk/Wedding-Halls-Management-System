using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Messages.GetMessagesByRequestId;

public sealed class GetMessagesByRequestIdQueryHandler
{
    private readonly IMessageRepository _repository;

    public GetMessagesByRequestIdQueryHandler(IMessageRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<MessageDto>> HandleAsync(GetMessagesByRequestIdQuery query, CancellationToken ct = default)
    {
        var items = await _repository.GetByRequestIdAsync(query.RequestId, ct);
        return items.Select(m => new MessageDto
        {
            Id = m.Id,
            RequestId = m.RequestId,
            SenderUserId = m.SenderUserId,
            Content = m.Content,
            CreatedAt = m.CreatedAt
        }).ToList();
    }
}
