using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models;

public class Tag
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
}
