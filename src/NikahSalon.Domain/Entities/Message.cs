namespace NikahSalon.Domain.Entities;

public class Message
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public Guid SenderUserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
