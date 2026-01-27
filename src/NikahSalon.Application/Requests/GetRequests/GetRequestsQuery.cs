using NikahSalon.Application.Common;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Requests.GetRequests;

public sealed class GetRequestsQuery : PagedQuery
{
    public RequestStatus? Status { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } = "desc"; // Default: newest first
}
