using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Halls.GetHallById;

public sealed class GetHallByIdQueryHandler
{
    private readonly IWeddingHallRepository _repository;

    public GetHallByIdQueryHandler(IWeddingHallRepository repository)
    {
        _repository = repository;
    }

    public async Task<WeddingHallDto?> HandleAsync(GetHallByIdQuery query, CancellationToken ct = default)
    {
        var hall = await _repository.GetByIdAsync(query.Id, ct);
        if (hall is null) return null;
        return new WeddingHallDto
        {
            Id = hall.Id,
            Name = hall.Name,
            Address = hall.Address,
            Capacity = hall.Capacity,
            Description = hall.Description,
            ImageUrl = hall.ImageUrl,
            TechnicalDetails = hall.TechnicalDetails
        };
    }
}
