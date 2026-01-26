using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NikahSalon.Application.Auth.GetCurrentUser;
using NikahSalon.Application.Auth.Login;
using NikahSalon.Application.Common;

namespace NikahSalon.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly LoginCommandHandler _loginHandler;
    private readonly GetCurrentUserQueryHandler _getCurrentUserHandler;
    private readonly LoginCommandValidator _loginValidator;

    public AuthController(
        LoginCommandHandler loginHandler,
        GetCurrentUserQueryHandler getCurrentUserHandler,
        LoginCommandValidator loginValidator)
    {
        _loginHandler = loginHandler;
        _getCurrentUserHandler = getCurrentUserHandler;
        _loginValidator = loginValidator;
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
}

public sealed class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
