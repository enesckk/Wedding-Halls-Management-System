using Microsoft.Extensions.Logging;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Messages.DeleteMessage;

public sealed class DeleteMessageCommandHandler
{
    private readonly IMessageRepository _repository;
    private readonly ILogger<DeleteMessageCommandHandler> _logger;

    public DeleteMessageCommandHandler(
        IMessageRepository repository,
        ILogger<DeleteMessageCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<bool> HandleAsync(DeleteMessageCommand command, CancellationToken ct = default)
    {
        _logger.LogInformation("Deleting message with ID: {MessageId} from request {RequestId}", command.Id, command.RequestId);

        var message = await _repository.GetByIdAsync(command.Id, ct);
        if (message == null)
        {
            _logger.LogWarning("Message with ID {MessageId} not found for deletion", command.Id);
            return false;
        }

        // Verify that the message belongs to the specified request
        if (message.RequestId != command.RequestId)
        {
            _logger.LogWarning(
                "Message {MessageId} does not belong to request {RequestId}. Actual RequestId: {ActualRequestId}",
                command.Id, command.RequestId, message.RequestId);
            return false;
        }

        var deleted = await _repository.DeleteAsync(command.Id, ct);
        
        if (deleted)
        {
            _logger.LogInformation(
                "Successfully deleted message with ID: {MessageId} from request {RequestId}, Content preview: {ContentPreview}",
                command.Id, command.RequestId, message.Content.Length > 50 ? message.Content.Substring(0, 50) + "..." : message.Content);
        }
        else
        {
            _logger.LogError("Failed to delete message with ID: {MessageId}", command.Id);
        }

        return deleted;
    }
}
