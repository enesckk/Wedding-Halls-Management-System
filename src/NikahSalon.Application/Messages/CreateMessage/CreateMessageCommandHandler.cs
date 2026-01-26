using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Messages.CreateMessage;

public sealed class CreateMessageCommandHandler
{
    private readonly IMessageRepository _messageRepository;
    private readonly IRequestRepository _requestRepository;

    public CreateMessageCommandHandler(
        IMessageRepository messageRepository,
        IRequestRepository requestRepository)
    {
        _messageRepository = messageRepository;
        _requestRepository = requestRepository;
    }

    public async Task<MessageDto> HandleAsync(CreateMessageCommand command, CancellationToken ct = default)
    {
        var request = await _requestRepository.GetByIdAsync(command.RequestId, ct);
        if (request is null)
            throw new InvalidOperationException("Request not found.");

        var entity = new Message
        {
            Id = Guid.NewGuid(),
            RequestId = command.RequestId,
            SenderUserId = command.SenderUserId,
            Content = command.Content,
            CreatedAt = DateTime.UtcNow
        };
        var created = await _messageRepository.AddAsync(entity, ct);
        return new MessageDto
        {
            Id = created.Id,
            RequestId = created.RequestId,
            SenderUserId = created.SenderUserId,
            Content = created.Content,
            CreatedAt = created.CreatedAt
        };
    }
}
