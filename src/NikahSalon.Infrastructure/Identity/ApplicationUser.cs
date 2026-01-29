using Microsoft.AspNetCore.Identity;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Infrastructure.Identity;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    /// <summary>
    /// Editor'lar için alan/departman (Nikah, Nişan, Konser, vb.). SuperAdmin ve Viewer için null.
    /// </summary>
    public EventType? Department { get; set; }
    public string? Phone { get; set; }
}
