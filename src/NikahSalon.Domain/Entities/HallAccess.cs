namespace NikahSalon.Domain.Entities;

/// <summary>
/// Hangi editörlerin hangi salonlara erişebileceğini belirler
/// </summary>
public class HallAccess
{
    public Guid Id { get; set; }
    public Guid HallId { get; set; } // Salon ID'si
    public Guid UserId { get; set; } // Editor kullanıcı ID'si
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public WeddingHall? Hall { get; set; }
}