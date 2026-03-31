using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models;

public class DailyTaskLog
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DailyTaskId { get; set; }
    public DailyTask? DailyTask { get; set; }
    public DateTime Date { get; set; }
    public bool IsCompleted { get; set; }
}
