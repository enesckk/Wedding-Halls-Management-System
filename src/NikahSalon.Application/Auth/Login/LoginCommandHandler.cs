using NikahSalon.Application.Common;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Auth.Login;

public sealed class LoginCommandHandler
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<LoginResult> HandleAsync(LoginCommand command, CancellationToken ct = default)
    {
        return await _authService.LoginAsync(command.Email, command.Password, ct);
    }
}
