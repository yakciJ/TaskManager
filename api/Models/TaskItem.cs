using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagerApi.Models;

public enum TaskPriority { Low, Medium, High }

public class TaskItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? Deadline { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
    public ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
}
