using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NikahSalon.Domain.Entities;
using NikahSalon.Domain.Enums;
using NikahSalon.Infrastructure.Identity;

namespace NikahSalon.Infrastructure.Data;

public static class SeedData
{
    public const string RoleViewer = "Viewer";
    public const string RoleEditor = "Editor";

    public static async Task SeedAsync(AppDbContext db, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        if (await roleManager.RoleExistsAsync(RoleViewer)) return;

        await roleManager.CreateAsync(new IdentityRole<Guid>(RoleViewer));
        await roleManager.CreateAsync(new IdentityRole<Guid>(RoleEditor));

        var viewer = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "viewer@nikahsalon.local",
            Email = "viewer@nikahsalon.local",
            FullName = "Demo Viewer",
            EmailConfirmed = true
        };
        await userManager.CreateAsync(viewer, "Viewer1!");
        await userManager.AddToRoleAsync(viewer, RoleViewer);

        var editor = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "editor@nikahsalon.local",
            Email = "editor@nikahsalon.local",
            FullName = "Demo Editor",
            EmailConfirmed = true
        };
        await userManager.CreateAsync(editor, "Editor1!");
        await userManager.AddToRoleAsync(editor, RoleEditor);

        if (await db.WeddingHalls.AnyAsync()) return;

        var hall1 = new WeddingHall
        {
            Id = Guid.NewGuid(),
            Name = "Atatürk Nikah Salonu",
            Address = "Cumhuriyet Mah. Atatürk Cad. No:12",
            Capacity = 150,
            Description = "Modern nikah salonu.",
            ImageUrl = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"
        };
        db.WeddingHalls.Add(hall1);

        var hall2 = new WeddingHall
        {
            Id = Guid.NewGuid(),
            Name = "Cumhuriyet Nikah Salonu",
            Address = "Yeni Mah. İstiklal Sok. No:45",
            Capacity = 100,
            Description = "Şık ve samimi atmosfer.",
            ImageUrl = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80"
        };
        db.WeddingHalls.Add(hall2);
        await db.SaveChangesAsync();

        var s1 = new Schedule
        {
            Id = Guid.NewGuid(),
            WeddingHallId = hall1.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(10, 0),
            Status = ScheduleStatus.Available
        };
        var s2 = new Schedule
        {
            Id = Guid.NewGuid(),
            WeddingHallId = hall1.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            StartTime = new TimeOnly(10, 30),
            EndTime = new TimeOnly(11, 30),
            Status = ScheduleStatus.Reserved
        };
        db.Schedules.AddRange(s1, s2);
        await db.SaveChangesAsync();
    }
}
