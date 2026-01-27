using NikahSalon.Application.Common;

namespace NikahSalon.Application.Halls.GetHalls;

public sealed class GetHallsQuery : PagedQuery
{
    public string? Search { get; set; }
}
