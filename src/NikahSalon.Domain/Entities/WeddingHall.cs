namespace NikahSalon.Domain.Entities;

public class WeddingHall
{
    public Guid Id { get; set; }
    public Guid CenterId { get; set; } // Merkez ID'si
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string TechnicalDetails { get; set; } = string.Empty;
    
    // Navigation property
    public Center? Center { get; set; }
}
