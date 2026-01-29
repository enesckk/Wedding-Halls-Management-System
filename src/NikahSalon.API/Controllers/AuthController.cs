using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NikahSalon.Application.Auth.GetCurrentUser;
using NikahSalon.Application.Auth.Login;
using NikahSalon.Application.Common;
using NikahSalon.Application.Users.UpdateUser;
using NikahSalon.Application.Users.GetUsers;

namespace NikahSalon.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly LoginCommandHandler _loginHandler;
    private readonly GetCurrentUserQueryHandler _getCurrentUserHandler;
    private readonly LoginCommandValidator _loginValidator;
    private readonly UpdateUserCommandHandler _updateUserHandler;
    private readonly UpdateUserCommandValidator _updateUserValidator;
    private readonly GetUsersQueryHandler _getUsersHandler;

    public AuthController(
        LoginCommandHandler loginHandler,
        GetCurrentUserQueryHandler getCurrentUserHandler,
        LoginCommandValidator loginValidator,
        UpdateUserCommandHandler updateUserHandler,
        UpdateUserCommandValidator updateUserValidator,
        GetUsersQueryHandler getUsersHandler)
    {
        _loginHandler = loginHandler;
        _getCurrentUserHandler = getCurrentUserHandler;
        _loginValidator = loginValidator;
        _updateUserHandler = updateUserHandler;
        _updateUserValidator = updateUserValidator;
        _getUsersHandler = getUsersHandler;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("LoginPolicy")]
    [ProducesResponseType(typeof(LoginResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<LoginResult>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var command = new LoginCommand { Email = request.Email, Password = request.Password };
        var validation = await _loginValidator.ValidateAsync(command, ct);
        if (!validation.IsValid)
            throw new FluentValidation.ValidationException(validation.Errors);

        var result = await _loginHandler.HandleAsync(command, ct);
        if (!result.Success)
            return BadRequest(new { success = false, message = result.Message });
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserInfo>> Me(CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var query = new GetCurrentUserQuery { UserId = userId };
        var user = await _getCurrentUserHandler.HandleAsync(query, ct);
        if (user is null)
            return NotFound();
        return Ok(user);
    }

    [HttpPut("me")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    [ProducesResponseType(typeof(UserInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<UserInfo>> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var command = new UpdateUserCommand
        {
            Id = userId,
            Email = request.Email,
            FullName = request.FullName,
            Phone = request.Phone,
            // Kullanıcı kendi rolünü ve departmanını değiştiremez, sadece SuperAdmin yapabilir
            Role = null,
            Department = null
        };

        var validation = await _updateUserValidator.ValidateAsync(command, ct);
        if (!validation.IsValid)
            throw new FluentValidation.ValidationException(validation.Errors);

        try
        {
            var updated = await _updateUserHandler.HandleAsync(command, ct);
            if (updated is null)
                return NotFound();
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("users")]
    [Authorize]
    [ProducesResponseType(typeof(PagedResult<UserInfo>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedResult<UserInfo>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 1000,
        CancellationToken ct = default)
    {
        var query = new GetUsersQuery
        {
            Page = page,
            PageSize = pageSize,
            Search = null
        };
        var result = await _getUsersHandler.HandleAsync(query, ct);
        return Ok(result);
    }
}

public sealed class UpdateProfileRequest
{
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
}

public sealed class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
