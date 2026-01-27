using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Dashboard.GetRequestsSummary;

public sealed class GetRequestsSummaryQueryHandler
{
    private readonly IRequestRepository _repository;

    public GetRequestsSummaryQueryHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<RequestsSummaryDto> HandleAsync(GetRequestsSummaryQuery query, CancellationToken ct = default)
    {
        var total = await _repository.GetTotalCountAsync(ct);
        var pending = await _repository.GetCountByStatusAsync(RequestStatus.Pending, ct);
        var answered = await _repository.GetCountByStatusAsync(RequestStatus.Answered, ct);

        return new RequestsSummaryDto
        {
            Total = total,
            Pending = pending,
            Answered = answered
        };
    }
}
