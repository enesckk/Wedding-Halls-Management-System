using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NikahSalon.Domain.Entities;
using NikahSalon.Infrastructure.Identity;

namespace NikahSalon.Infrastructure.Data;

public sealed class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<WeddingHall> WeddingHalls => Set<WeddingHall>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<Request> Requests => Set<Request>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<WeddingHall>(e =>
        {
            e.ToTable("WeddingHalls");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Address).HasMaxLength(500).IsRequired();
            e.Property(x => x.Description).HasMaxLength(2000).IsRequired();
            e.Property(x => x.ImageUrl).HasMaxLength(1000);
            e.Property(x => x.TechnicalDetails).HasMaxLength(5000);
        });

        builder.Entity<Schedule>(e =>
        {
            e.ToTable("Schedules");
            e.HasKey(x => x.Id);
            e.Property(x => x.Date).IsRequired();
            e.Property(x => x.StartTime).IsRequired();
            e.Property(x => x.EndTime).IsRequired();
            e.HasIndex(x => new { x.WeddingHallId, x.Date });
        });

        builder.Entity<Request>(e =>
        {
            e.ToTable("Requests");
            e.HasKey(x => x.Id);
            e.Property(x => x.Message).HasMaxLength(2000).IsRequired();
            e.Property(x => x.CreatedAt).IsRequired();
            e.Property(x => x.EventType).IsRequired();
            e.Property(x => x.EventName).HasMaxLength(200).IsRequired();
            e.Property(x => x.EventOwner).HasMaxLength(200).IsRequired();
            e.Property(x => x.EventDate).IsRequired();
            e.Property(x => x.EventTime).IsRequired();
        });

        builder.Entity<Message>(e =>
        {
            e.ToTable("Messages");
            e.HasKey(x => x.Id);
            e.Property(x => x.Content).HasMaxLength(2000).IsRequired();
            e.Property(x => x.CreatedAt).IsRequired();
            e.HasIndex(x => x.RequestId);
        });
    }
}
