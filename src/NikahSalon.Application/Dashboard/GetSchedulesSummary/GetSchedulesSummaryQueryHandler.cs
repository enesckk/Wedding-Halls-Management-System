using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Dashboard.GetSchedulesSummary;

public sealed class GetSchedulesSummaryQueryHandler
{
    private readonly IScheduleRepository _repository;

    public GetSchedulesSummaryQueryHandler(IScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<SchedulesSummaryDto> HandleAsync(GetSchedulesSummaryQuery query, CancellationToken ct = default)
    {
        var total = await _repository.GetTotalCountAsync(ct);
        var available = await _repository.GetCountByStatusAsync(ScheduleStatus.Available, ct);
        var reserved = await _repository.GetCountByStatusAsync(ScheduleStatus.Reserved, ct);

        return new SchedulesSummaryDto
        {
            Total = total,
            Available = available,
            Reserved = reserved
        };
    }
}
