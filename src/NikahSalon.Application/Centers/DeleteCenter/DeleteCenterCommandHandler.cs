using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Centers.DeleteCenter;

public sealed class DeleteCenterCommandHandler
{
    private readonly ICenterRepository _repository;

    public DeleteCenterCommandHandler(ICenterRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> HandleAsync(DeleteCenterCommand command, CancellationToken ct = default)
    {
        return await _repository.DeleteAsync(command.Id, ct);
    }
}
