using Microsoft.Extensions.Logging;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Requests.DeleteRequest;

public sealed class DeleteRequestCommandHandler
{
    private readonly IRequestRepository _requestRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly ILogger<DeleteRequestCommandHandler> _logger;

    public DeleteRequestCommandHandler(
        IRequestRepository requestRepository,
        IMessageRepository messageRepository,
        ILogger<DeleteRequestCommandHandler> logger)
    {
        _requestRepository = requestRepository;
        _messageRepository = messageRepository;
        _logger = logger;
    }

    public async Task<bool> HandleAsync(DeleteRequestCommand command, CancellationToken ct = default)
    {
        _logger.LogInformation("Deleting request with ID: {RequestId}", command.Id);

        var request = await _requestRepository.GetByIdAsync(command.Id, ct);
        if (request == null)
        {
            _logger.LogWarning("Request with ID {RequestId} not found for deletion", command.Id);
            return false;
        }

        // First, delete all messages associated with this request
        var messages = await _messageRepository.GetByRequestIdAsync(command.Id, ct);
        foreach (var message in messages)
        {
            await _messageRepository.DeleteAsync(message.Id, ct);
            _logger.LogDebug("Deleted message {MessageId} associated with request {RequestId}", message.Id, command.Id);
        }

        // Then delete the request itself
        var deleted = await _requestRepository.DeleteAsync(command.Id, ct);
        
        if (deleted)
        {
            _logger.LogInformation(
                "Successfully deleted request with ID: {RequestId}, EventName: {EventName}, Status: {Status}",
                command.Id, request.EventName, request.Status);
        }
        else
        {
            _logger.LogError("Failed to delete request with ID: {RequestId}", command.Id);
        }

        return deleted;
    }
}
