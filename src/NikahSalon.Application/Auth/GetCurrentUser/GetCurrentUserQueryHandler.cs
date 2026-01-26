using NikahSalon.Application.Common;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Auth.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler
{
    private readonly IUserRepository _userRepository;

    public GetCurrentUserQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserInfo?> HandleAsync(GetCurrentUserQuery query, CancellationToken ct = default)
    {
        return await _userRepository.GetByIdAsync(query.UserId, ct);
    }
}
