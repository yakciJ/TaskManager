using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models;

public class DailyTask
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public ICollection<DailyTaskLog> Logs { get; set; } = new List<DailyTaskLog>();
}
