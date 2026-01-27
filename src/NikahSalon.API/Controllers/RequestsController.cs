using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NikahSalon.Application.Messages.CreateMessage;
using NikahSalon.Application.Messages.DeleteMessage;
using NikahSalon.Application.Messages.GetMessagesByRequestId;
using NikahSalon.Application.Requests.AnswerRequest;
using NikahSalon.Application.Requests.CreateRequest;
using NikahSalon.Application.Requests.DeleteRequest;
using NikahSalon.Application.Requests.GetRequestById;
using NikahSalon.Application.Requests.GetRequests;

namespace NikahSalon.API.Controllers;

[ApiController]
[Route("api/v1/requests")]
[Authorize]
public sealed class RequestsController : ControllerBase
{
    private readonly CreateRequestCommandHandler _createHandler;
    private readonly GetRequestsQueryHandler _getRequestsHandler;
    private readonly GetRequestByIdQueryHandler _getRequestByIdHandler;
    private readonly AnswerRequestCommandHandler _answerHandler;
    private readonly DeleteRequestCommandHandler _deleteHandler;
    private readonly CreateRequestCommandValidator _createValidator;
    private readonly CreateMessageCommandHandler _createMessageHandler;
    private readonly DeleteMessageCommandHandler _deleteMessageHandler;
    private readonly GetMessagesByRequestIdQueryHandler _getMessagesHandler;
    private readonly CreateMessageCommandValidator _createMessageValidator;

    public RequestsController(
        CreateRequestCommandHandler createHandler,
        GetRequestsQueryHandler getRequestsHandler,
        GetRequestByIdQueryHandler getRequestByIdHandler,
        AnswerRequestCommandHandler answerHandler,
        DeleteRequestCommandHandler deleteHandler,
        CreateRequestCommandValidator createValidator,
        CreateMessageCommandHandler createMessageHandler,
        DeleteMessageCommandHandler deleteMessageHandler,
        GetMessagesByRequestIdQueryHandler getMessagesHandler,
        CreateMessageCommandValidator createMessageValidator)
    {
        _createHandler = createHandler;
        _getRequestsHandler = getRequestsHandler;
        _getRequestByIdHandler = getRequestByIdHandler;
        _answerHandler = answerHandler;
        _deleteHandler = deleteHandler;
        _createValidator = createValidator;
        _createMessageHandler = createMessageHandler;
        _deleteMessageHandler = deleteMessageHandler;
        _getMessagesHandler = getMessagesHandler;
        _createMessageValidator = createMessageValidator;
    }

    [HttpPost]
    [Authorize(Roles = "Viewer")]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Create([FromBody] CreateRequestRequest request, CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        if (!DateOnly.TryParse(request.EventDate, out var eventDate))
            return BadRequest(new { success = false, message = "Invalid EventDate format." });
        if (!TimeOnly.TryParse(request.EventTime, out var eventTime))
            return BadRequest(new { success = false, message = "Invalid EventTime format." });
        if (!Enum.IsDefined(typeof(NikahSalon.Domain.Enums.EventType), request.EventType))
            return BadRequest(new { success = false, message = "Invalid EventType." });

        var command = new CreateRequestCommand
        {
            WeddingHallId = request.WeddingHallId,
            CreatedByUserId = userId,
            Message = request.Message,
            EventType = (NikahSalon.Domain.Enums.EventType)request.EventType,
            EventName = request.EventName,
            EventOwner = request.EventOwner,
            EventDate = eventDate,
            EventTime = eventTime
        };
        var validation = await _createValidator.ValidateAsync(command, ct);
        if (!validation.IsValid)
            throw new FluentValidation.ValidationException(validation.Errors);

        var created = await _createHandler.HandleAsync(command, ct);
        return Created($"/api/v1/requests/{created.Id}", created);
    }

    [HttpGet]
    [Authorize(Roles = "Editor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? status = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        CancellationToken ct = default)
    {
        var query = new GetRequestsQuery
        {
            Page = page,
            PageSize = pageSize,
            Status = status.HasValue ? (NikahSalon.Domain.Enums.RequestStatus?)status.Value : null,
            SortBy = sortBy,
            SortOrder = sortOrder
        };
        var result = await _getRequestsHandler.HandleAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var query = new GetRequestByIdQuery { Id = id };
        var request = await _getRequestByIdHandler.HandleAsync(query, ct);
        if (request is null) return NotFound();
        return Ok(request);
    }

    [HttpPut("{id:guid}/answer")]
    [Authorize(Roles = "Editor")]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Answer(Guid id, CancellationToken ct)
    {
        var command = new AnswerRequestCommand { Id = id };
        try
        {
            var result = await _answerHandler.HandleAsync(command, ct);
            if (result is null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/messages")]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> CreateMessage(Guid id, [FromBody] CreateMessageRequest request, CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var command = new CreateMessageCommand
        {
            RequestId = id,
            SenderUserId = userId,
            Content = request.Content
        };
        var validation = await _createMessageValidator.ValidateAsync(command, ct);
        if (!validation.IsValid)
            throw new FluentValidation.ValidationException(validation.Errors);

        try
        {
            var created = await _createMessageHandler.HandleAsync(command, ct);
            return Created($"/api/v1/requests/{id}/messages/{created.Id}", created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("{id:guid}/messages")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMessages(Guid id, CancellationToken ct)
    {
        var query = new GetMessagesByRequestIdQuery { RequestId = id };
        var items = await _getMessagesHandler.HandleAsync(query, ct);
        return Ok(items);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Editor")]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var command = new DeleteRequestCommand { Id = id };
        var deleted = await _deleteHandler.HandleAsync(command, ct);
        
        if (!deleted)
            return NotFound(new { success = false, message = "Request not found." });

        return NoContent();
    }

    [HttpDelete("{id:guid}/messages/{messageId:guid}")]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> DeleteMessage(Guid id, Guid messageId, CancellationToken ct)
    {
        var command = new DeleteMessageCommand 
        { 
            Id = messageId,
            RequestId = id
        };
        var deleted = await _deleteMessageHandler.HandleAsync(command, ct);
        
        if (!deleted)
            return NotFound(new { success = false, message = "Message not found or does not belong to the specified request." });

        return NoContent();
    }
}

public sealed class CreateRequestRequest
{
    public Guid WeddingHallId { get; set; }
    public string Message { get; set; } = string.Empty;
    public int EventType { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string EventOwner { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty;
    public string EventTime { get; set; } = string.Empty;
}

public sealed class CreateMessageRequest
{
    public string Content { get; set; } = string.Empty;
}
