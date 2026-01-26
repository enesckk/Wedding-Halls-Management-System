using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Halls.UpdateHall;

public sealed class UpdateHallCommandHandler
{
    private readonly IWeddingHallRepository _repository;

    public UpdateHallCommandHandler(IWeddingHallRepository repository)
    {
        _repository = repository;
    }

    public async Task<WeddingHallDto?> HandleAsync(UpdateHallCommand command, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(command.Id, ct);
        if (existing is null) return null;
        existing.Name = command.Name;
        existing.Address = command.Address;
        existing.Capacity = command.Capacity;
        existing.Description = command.Description;
        existing.ImageUrl = command.ImageUrl;
        await _repository.UpdateAsync(existing, ct);
        return new WeddingHallDto
        {
            Id = existing.Id,
            Name = existing.Name,
            Address = existing.Address,
            Capacity = existing.Capacity,
            Description = existing.Description,
            ImageUrl = existing.ImageUrl
        };
    }
}
