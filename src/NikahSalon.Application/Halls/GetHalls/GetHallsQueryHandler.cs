using NikahSalon.Application.Common;
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

    public async Task<PagedResult<WeddingHallDto>> HandleAsync(GetHallsQuery query, CancellationToken ct = default)
    {
        // Validate pagination parameters
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;
        if (pageSize > 100) pageSize = 100; // Max page size limit

        var (halls, totalCount) = await _repository.GetPagedAsync(page, pageSize, query.Search, ct);
        
        var items = halls.Select(h => new WeddingHallDto
        {
            Id = h.Id,
            Name = h.Name,
            Address = h.Address,
            Capacity = h.Capacity,
            Description = h.Description,
            ImageUrl = h.ImageUrl,
            TechnicalDetails = h.TechnicalDetails
        }).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResult<WeddingHallDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
