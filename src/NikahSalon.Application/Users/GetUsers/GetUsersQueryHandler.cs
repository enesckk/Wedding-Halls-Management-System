using NikahSalon.Application.Common;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Users.GetUsers;

public sealed class GetUsersQueryHandler
{
    private readonly IUserRepository _repository;

    public GetUsersQueryHandler(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<UserInfo>> HandleAsync(GetUsersQuery query, CancellationToken ct = default)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;
        if (pageSize > 100) pageSize = 100;

        var (items, totalCount) = await _repository.GetPagedAsync(page, pageSize, query.Search, ct);
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResult<UserInfo>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
