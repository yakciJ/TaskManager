using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data;
using TaskManagerApi.Models;

namespace TaskManagerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        return await _context.Tasks
                             .Include(t => t.SubTasks)
                             .Include(t => t.TaskTags)
                             .ThenInclude(tt => tt.Tag)
                             .OrderByDescending(t => t.CreatedAt)
                             .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(Guid id)
    {
        var task = await _context.Tasks
                                 .Include(t => t.SubTasks)
                                 .Include(t => t.TaskTags)
                                 .ThenInclude(tt => tt.Tag)
                                 .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        return task;
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask([FromBody] CreateTaskDto dto)
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Deadline = dto.Deadline.HasValue ? DateTime.SpecifyKind(dto.Deadline.Value.Date, DateTimeKind.Utc) : null,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.Deadline = dto.Deadline.HasValue ? DateTime.SpecifyKind(dto.Deadline.Value.Date, DateTimeKind.Utc) : null;
        task.IsCompleted = dto.IsCompleted;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // ── Tag Assignment ─────────────────────────────────────────────────────
    [HttpPost("{id}/tags/{tagId}")]
    public async Task<IActionResult> AddTagToTask(Guid id, Guid tagId)
    {
        var taskExists = await _context.Tasks.AnyAsync(t => t.Id == id);
        var tagExists = await _context.Tags.AnyAsync(t => t.Id == tagId);

        if (!taskExists || !tagExists)
            return NotFound();

        var alreadyAssigned = await _context.TaskTags
            .AnyAsync(tt => tt.TaskId == id && tt.TagId == tagId);

        if (!alreadyAssigned)
        {
            _context.TaskTags.Add(new TaskTag { TaskId = id, TagId = tagId });
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    [HttpDelete("{id}/tags/{tagId}")]
    public async Task<IActionResult> RemoveTagFromTask(Guid id, Guid tagId)
    {
        var taskTag = await _context.TaskTags
            .FirstOrDefaultAsync(tt => tt.TaskId == id && tt.TagId == tagId);

        if (taskTag == null)
            return NotFound();

        _context.TaskTags.Remove(taskTag);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // ── SubTask Endpoints ──────────────────────────────────────────────────
    [HttpPost("{id}/subtasks")]
    public async Task<ActionResult<SubTask>> CreateSubTask(Guid id, [FromBody] CreateSubTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        var subTask = new SubTask
        {
            Id = Guid.NewGuid(),
            TaskId = id,
            Title = dto.Title,
            IsCompleted = false
        };

        _context.SubTasks.Add(subTask);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id }, subTask);
    }

    [HttpPut("/api/subtasks/{subId}")]
    public async Task<IActionResult> UpdateSubTask(Guid subId, [FromBody] UpdateSubTaskDto dto)
    {
        var subTask = await _context.SubTasks.FindAsync(subId);
        if (subTask == null)
            return NotFound();

        subTask.Title = dto.Title;
        subTask.IsCompleted = dto.IsCompleted;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("/api/subtasks/{subId}")]
    public async Task<IActionResult> DeleteSubTask(Guid subId)
    {
        var subTask = await _context.SubTasks.FindAsync(subId);
        if (subTask == null)
            return NotFound();

        _context.SubTasks.Remove(subTask);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TaskExists(Guid id)
    {
        return _context.Tasks.Any(e => e.Id == id);
    }
}

// ── DTOs ────────────────────────────────────────────────────────────────────
public record CreateTaskDto(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? Deadline
);

public record UpdateTaskDto(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? Deadline,
    bool IsCompleted
);

public record CreateSubTaskDto(string Title);

public record UpdateSubTaskDto(string Title, bool IsCompleted);
