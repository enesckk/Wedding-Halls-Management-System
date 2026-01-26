using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NikahSalon.Domain.Enums;
using NikahSalon.Application.Schedules.UpdateSchedule;

namespace NikahSalon.API.Controllers;

[ApiController]
[Route("api/v1/schedules")]
[Authorize(Roles = "Editor")]
public sealed class SchedulesController : ControllerBase
{
    private readonly UpdateScheduleCommandHandler _updateHandler;
    private readonly UpdateScheduleCommandValidator _updateValidator;

    public SchedulesController(
        UpdateScheduleCommandHandler updateHandler,
        UpdateScheduleCommandValidator updateValidator)
    {
        _updateHandler = updateHandler;
        _updateValidator = updateValidator;
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
}

public sealed class UpdateScheduleRequest
{
    public Guid WeddingHallId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ScheduleStatus Status { get; set; }
}
