using Microsoft.Extensions.Logging;
using NikahSalon.Application.Common;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Users.CreateUser;

public sealed class CreateUserCommandHandler
{
    private readonly IUserRepository _repository;
    private readonly ILogger<CreateUserCommandHandler> _logger;

    public CreateUserCommandHandler(
        IUserRepository repository,
        ILogger<CreateUserCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<UserInfo> HandleAsync(CreateUserCommand command, CancellationToken ct = default)
    {
        _logger.LogInformation("Creating user with email: {Email}, Role: {Role}", command.Email, command.Role);

        var userInfo = await _repository.CreateAsync(
            command.Email,
            command.Password,
            command.FullName,
            command.Role,
            ct);

        _logger.LogInformation(
            "Successfully created user with ID: {UserId}, Email: {Email}, Role: {Role}",
            userInfo.Id, userInfo.Email, userInfo.Role);

        return userInfo;
    }
}
