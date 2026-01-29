using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Centers.GetCenterById;

public sealed class GetCenterByIdQueryHandler
{
    private readonly ICenterRepository _repository;

    public GetCenterByIdQueryHandler(ICenterRepository repository)
    {
        _repository = repository;
    }

    public async Task<CenterDto?> HandleAsync(GetCenterByIdQuery query, CancellationToken ct = default)
    {
        var center = await _repository.GetByIdAsync(query.Id, ct);
        if (center is null) return null;

        return new CenterDto
        {
            Id = center.Id,
            Name = center.Name,
            Address = center.Address,
            Description = center.Description,
            ImageUrl = center.ImageUrl,
            CreatedAt = center.CreatedAt
        };
    }
}
