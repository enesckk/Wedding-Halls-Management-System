namespace NikahSalon.Application.Common;

/// <summary>
/// Base class for paginated queries.
/// </summary>
public abstract class PagedQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    protected PagedQuery()
    {
        // Validate and normalize page and pageSize
        if (Page < 1) Page = 1;
        if (PageSize < 1) PageSize = 10;
        if (PageSize > 100) PageSize = 100; // Max page size limit
    }
}
