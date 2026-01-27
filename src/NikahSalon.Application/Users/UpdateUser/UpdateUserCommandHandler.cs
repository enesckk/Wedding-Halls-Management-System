using Microsoft.Extensions.Logging;
using NikahSalon.Application.Common;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Users.UpdateUser;

public sealed class UpdateUserCommandHandler
{
    private readonly IUserRepository _repository;
    private readonly ILogger<UpdateUserCommandHandler> _logger;

    public UpdateUserCommandHandler(
        IUserRepository repository,
        ILogger<UpdateUserCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<UserInfo?> HandleAsync(UpdateUserCommand command, CancellationToken ct = default)
    {
        _logger.LogInformation("Updating user with ID: {UserId}", command.Id);

        var userInfo = await _repository.UpdateAsync(
            command.Id,
            command.Email,
            command.FullName,
            command.Role,
            ct);

        if (userInfo == null)
        {
            _logger.LogWarning("User with ID {UserId} not found for update", command.Id);
            return null;
        }

        _logger.LogInformation(
            "Successfully updated user with ID: {UserId}, Email: {Email}, Role: {Role}",
            userInfo.Id, userInfo.Email, userInfo.Role);

        return userInfo;
    }
}
