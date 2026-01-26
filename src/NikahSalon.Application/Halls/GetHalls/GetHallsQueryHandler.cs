using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Halls.GetHalls;

public sealed class GetHallsQueryHandler
{
    private readonly IWeddingHallRepository _repository;

    public GetHallsQueryHandler(IWeddingHallRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<WeddingHallDto>> HandleAsync(GetHallsQuery query, CancellationToken ct = default)
    {
        var halls = await _repository.GetAllAsync(ct);
        return halls.Select(h => new WeddingHallDto
        {
            Id = h.Id,
            Name = h.Name,
            Address = h.Address,
            Capacity = h.Capacity,
            Description = h.Description,
            ImageUrl = h.ImageUrl
        }).ToList();
    }
}
