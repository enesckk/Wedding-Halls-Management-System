using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Halls.CreateHall;

public sealed class CreateHallCommandHandler
{
    private readonly IWeddingHallRepository _repository;

    public CreateHallCommandHandler(IWeddingHallRepository repository)
    {
        _repository = repository;
    }

    public async Task<WeddingHallDto> HandleAsync(CreateHallCommand command, CancellationToken ct = default)
    {
        var entity = new WeddingHall
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            Address = command.Address,
            Capacity = command.Capacity,
            Description = command.Description,
            ImageUrl = command.ImageUrl,
            TechnicalDetails = command.TechnicalDetails
        };
        var created = await _repository.AddAsync(entity, ct);
        return new WeddingHallDto
        {
            Id = created.Id,
            Name = created.Name,
            Address = created.Address,
            Capacity = created.Capacity,
            Description = created.Description,
            ImageUrl = created.ImageUrl,
            TechnicalDetails = created.TechnicalDetails
        };
    }
}
