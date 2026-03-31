using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models;

public class SubTask
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskId { get; set; }
    public TaskItem? TaskItem { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}
