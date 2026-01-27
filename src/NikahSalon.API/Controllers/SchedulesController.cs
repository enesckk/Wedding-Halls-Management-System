using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NikahSalon.Domain.Enums;
using NikahSalon.Application.Schedules.CreateSchedule;
using NikahSalon.Application.Schedules.DeleteSchedule;
using NikahSalon.Application.Schedules.GetScheduleById;
using NikahSalon.Application.Schedules.UpdateSchedule;

namespace NikahSalon.API.Controllers;

[ApiController]
[Route("api/v1/schedules")]
[Authorize(Roles = "Editor")]
public sealed class SchedulesController : ControllerBase
{
    private readonly GetScheduleByIdQueryHandler _getByIdHandler;
    private readonly CreateScheduleCommandHandler _createHandler;
    private readonly UpdateScheduleCommandHandler _updateHandler;
    private readonly DeleteScheduleCommandHandler _deleteHandler;
    private readonly CreateScheduleCommandValidator _createValidator;
    private readonly UpdateScheduleCommandValidator _updateValidator;

    public SchedulesController(
        GetScheduleByIdQueryHandler getByIdHandler,
        CreateScheduleCommandHandler createHandler,
        UpdateScheduleCommandHandler updateHandler,
        DeleteScheduleCommandHandler deleteHandler,
        CreateScheduleCommandValidator createValidator,
        UpdateScheduleCommandValidator updateValidator)
    {
        _getByIdHandler = getByIdHandler;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var query = new GetScheduleByIdQuery { Id = id };
        var schedule = await _getByIdHandler.HandleAsync(query, ct);
        if (schedule is null) return NotFound();
        return Ok(schedule);
    }

    [HttpPost]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Create([FromBody] CreateScheduleRequest request, CancellationToken ct)
    {
        var command = new CreateScheduleCommand
        {
            WeddingHallId = request.WeddingHallId,
            Date = request.Date,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = request.Status
        };
        var validation = await _createValidator.ValidateAsync(command, ct);
        if (!validation.IsValid)
            throw new FluentValidation.ValidationException(validation.Errors);

        try
        {
            var created = await _createHandler.HandleAsync(command, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateScheduleRequest request, CancellationToken ct)
    {
        var command = new UpdateScheduleCommand
        {
            Id = id,
            WeddingHallId = request.WeddingHallId,
            Date = request.Date,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = request.Status
        };
        var validation = await _updateValidator.ValidateAsync(command, ct);
        if (!validation.IsValid)
            throw new FluentValidation.ValidationException(validation.Errors);

        var updated = await _updateHandler.HandleAsync(command, ct);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var command = new DeleteScheduleCommand { Id = id };
        var deleted = await _deleteHandler.HandleAsync(command, ct);
        
        if (!deleted)
            return NotFound(new { success = false, message = "Schedule not found." });

        return NoContent();
    }
}

public sealed class CreateScheduleRequest
{
    public Guid WeddingHallId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ScheduleStatus Status { get; set; }
}

public sealed class UpdateScheduleRequest
{
    public Guid WeddingHallId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ScheduleStatus Status { get; set; }
}
