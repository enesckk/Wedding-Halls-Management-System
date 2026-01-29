using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Centers.GetCenters;

public sealed class GetCentersQueryHandler
{
    private readonly ICenterRepository _repository;

    public GetCentersQueryHandler(ICenterRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<CenterDto>> HandleAsync(GetCentersQuery query, CancellationToken ct = default)
    {
        var centers = await _repository.GetAllAsync(ct);
        return centers.Select(c => new CenterDto
        {
            Id = c.Id,
            Name = c.Name,
            Address = c.Address,
            Description = c.Description,
            ImageUrl = c.ImageUrl,
            CreatedAt = c.CreatedAt
        }).ToList();
    }
}
