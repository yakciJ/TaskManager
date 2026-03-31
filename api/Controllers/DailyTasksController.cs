using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data;
using TaskManagerApi.Models;

namespace TaskManagerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DailyTasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public DailyTasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DailyTask>>> GetDailyTasks()
    {
        return await _context.DailyTasks
            .Where(dt => dt.IsActive)
            .Include(dt => dt.Logs)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<DailyTask>> CreateDailyTask([FromBody] CreateDailyTaskDto dto)
    {
        var dailyTask = new DailyTask
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.DailyTasks.Add(dailyTask);
        await _context.SaveChangesAsync();
        return Ok(dailyTask);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDailyTask(Guid id)
    {
        var habit = await _context.DailyTasks.FindAsync(id);
        if (habit == null)
            return NotFound();

        // Soft-delete: just mark inactive so historical logs are preserved
        habit.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("calendar")]
    public async Task<ActionResult<IEnumerable<DailyTaskLog>>> GetCalendarStats([FromQuery] string month)
    {
        if (!DateTime.TryParse($"{month}-01", out DateTime targetMonth))
            return BadRequest("Invalid month format. Use YYYY-MM.");

        var nextMonth = targetMonth.AddMonths(1);
        return await _context.DailyTaskLogs
                             .Where(log => log.Date >= targetMonth && log.Date < nextMonth)
                             .ToListAsync();
    }

    [HttpPost("{id}/log")]
    public async Task<IActionResult> LogDailyTask(Guid id, [FromBody] LogDailyTaskDto dto)
    {
        var dailyTask = await _context.DailyTasks.FindAsync(id);
        if (dailyTask == null)
            return NotFound();

        if (!DateTime.TryParse(dto.Date, out DateTime logDate))
            return BadRequest("Invalid date format. Use YYYY-MM-DD.");

        // Normalise to UTC midnight for consistent date-only comparison
        logDate = DateTime.SpecifyKind(logDate.Date, DateTimeKind.Utc);

        var existingLog = await _context.DailyTaskLogs
            .FirstOrDefaultAsync(l => l.DailyTaskId == id && l.Date.Date == logDate.Date);

        if (existingLog != null)
        {
            existingLog.IsCompleted = dto.IsCompleted;
        }
        else
        {
            _context.DailyTaskLogs.Add(new DailyTaskLog
            {
                Id = Guid.NewGuid(),
                DailyTaskId = id,
                Date = logDate,
                IsCompleted = dto.IsCompleted
            });
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateDailyTaskDto(string Title, string? Description, bool IsActive);
public record LogDailyTaskDto(string Date, bool IsCompleted);
