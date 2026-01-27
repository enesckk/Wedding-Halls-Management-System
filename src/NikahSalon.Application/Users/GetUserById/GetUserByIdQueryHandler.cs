using NikahSalon.Application.Common;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Users.GetUserById;

public sealed class GetUserByIdQueryHandler
{
    private readonly IUserRepository _repository;

    public GetUserByIdQueryHandler(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserInfo?> HandleAsync(GetUserByIdQuery query, CancellationToken ct = default)
    {
        return await _repository.GetByIdAsync(query.Id, ct);
    }
}
