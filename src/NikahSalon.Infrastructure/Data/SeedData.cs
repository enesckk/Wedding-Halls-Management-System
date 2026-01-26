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
        // Rolleri oluştur
        if (!await roleManager.RoleExistsAsync(RoleViewer))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(RoleViewer));
        }
        if (!await roleManager.RoleExistsAsync(RoleEditor))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(RoleEditor));
        }

        // Viewer kullanıcısını oluştur
        var viewerEmail = "viewer@nikahsalon.local";
        if (await userManager.FindByEmailAsync(viewerEmail) == null)
        {
            var viewer = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = viewerEmail,
                Email = viewerEmail,
                FullName = "Demo Viewer",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(viewer, "Viewer1!");
            if (result.Succeeded)
            {
                // SecurityStamp'i güncelle
                await userManager.UpdateSecurityStampAsync(viewer);
                await db.SaveChangesAsync();
                // Kullanıcıyı ID ile tekrar yükle
                var savedViewer = await userManager.FindByIdAsync(viewer.Id.ToString());
                if (savedViewer != null)
                {
                    await userManager.AddToRoleAsync(savedViewer, RoleViewer);
                }
            }
        }

        // Editor kullanıcısını oluştur
        var editorEmail = "editor@nikahsalon.local";
        if (await userManager.FindByEmailAsync(editorEmail) == null)
        {
            var editor = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = editorEmail,
                Email = editorEmail,
                FullName = "Demo Editor",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(editor, "Editor1!");
            if (result.Succeeded)
            {
                // SecurityStamp'i güncelle
                await userManager.UpdateSecurityStampAsync(editor);
                await db.SaveChangesAsync();
                // Kullanıcıyı ID ile tekrar yükle
                var savedEditor = await userManager.FindByIdAsync(editor.Id.ToString());
                if (savedEditor != null)
                {
                    await userManager.AddToRoleAsync(savedEditor, RoleEditor);
                }
            }
        }

        // Enes Editor kullanıcısını oluştur
        var enesEmail = "enes@gmail.com";
        if (await userManager.FindByEmailAsync(enesEmail) == null)
        {
            var enesEditor = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = enesEmail,
                Email = enesEmail,
                FullName = "Enes Editor",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(enesEditor, "enes123");
            if (result.Succeeded)
            {
                // Veritabanı değişikliklerini kaydet
                await db.SaveChangesAsync();
                // Kullanıcıyı email ile tekrar yükle (SecurityStamp için)
                await Task.Delay(100); // Kısa bir gecikme
                var savedEnes = await userManager.FindByEmailAsync(enesEmail);
                if (savedEnes != null && savedEnes.SecurityStamp != null)
                {
                    await userManager.AddToRoleAsync(savedEnes, RoleEditor);
                }
            }
        }

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
