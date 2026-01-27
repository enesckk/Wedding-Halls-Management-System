using NikahSalon.Application.Common;

namespace NikahSalon.Application.Users.GetUsers;

public sealed class GetUsersQuery : PagedQuery
{
    public string? Search { get; set; }
}
