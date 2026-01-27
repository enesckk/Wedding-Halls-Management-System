using Microsoft.Extensions.Logging;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Halls.DeleteHall;

public sealed class DeleteHallCommandHandler
{
    private readonly IWeddingHallRepository _repository;
    private readonly ILogger<DeleteHallCommandHandler> _logger;

    public DeleteHallCommandHandler(
        IWeddingHallRepository repository,
        ILogger<DeleteHallCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<bool> HandleAsync(DeleteHallCommand command, CancellationToken ct = default)
    {
        _logger.LogInformation("Deleting hall with ID: {HallId}", command.Id);

        var hall = await _repository.GetByIdAsync(command.Id, ct);
        if (hall == null)
        {
            _logger.LogWarning("Hall with ID {HallId} not found for deletion", command.Id);
            return false;
        }

        var deleted = await _repository.DeleteAsync(command.Id, ct);
        
        if (deleted)
        {
            _logger.LogInformation("Successfully deleted hall with ID: {HallId}, Name: {HallName}", command.Id, hall.Name);
        }
        else
        {
            _logger.LogError("Failed to delete hall with ID: {HallId}", command.Id);
        }

        return deleted;
    }
}
