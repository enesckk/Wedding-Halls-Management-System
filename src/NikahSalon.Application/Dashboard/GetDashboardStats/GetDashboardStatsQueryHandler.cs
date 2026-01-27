using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Dashboard.GetDashboardStats;

public sealed class GetDashboardStatsQueryHandler
{
    private readonly IWeddingHallRepository _hallRepository;
    private readonly IRequestRepository _requestRepository;
    private readonly IScheduleRepository _scheduleRepository;

    public GetDashboardStatsQueryHandler(
        IWeddingHallRepository hallRepository,
        IRequestRepository requestRepository,
        IScheduleRepository scheduleRepository)
    {
        _hallRepository = hallRepository;
        _requestRepository = requestRepository;
        _scheduleRepository = scheduleRepository;
    }

    public async Task<DashboardStatsDto> HandleAsync(GetDashboardStatsQuery query, CancellationToken ct = default)
    {
        var totalHalls = await _hallRepository.GetTotalCountAsync(ct);
        var totalRequests = await _requestRepository.GetTotalCountAsync(ct);
        var totalSchedules = await _scheduleRepository.GetTotalCountAsync(ct);
        
        var pendingRequests = await _requestRepository.GetCountByStatusAsync(RequestStatus.Pending, ct);
        var answeredRequests = await _requestRepository.GetCountByStatusAsync(RequestStatus.Answered, ct);
        
        var availableSchedules = await _scheduleRepository.GetCountByStatusAsync(ScheduleStatus.Available, ct);
        var reservedSchedules = await _scheduleRepository.GetCountByStatusAsync(ScheduleStatus.Reserved, ct);

        return new DashboardStatsDto
        {
            TotalHalls = totalHalls,
            TotalRequests = totalRequests,
            TotalSchedules = totalSchedules,
            PendingRequests = pendingRequests,
            AnsweredRequests = answeredRequests,
            AvailableSchedules = availableSchedules,
            ReservedSchedules = reservedSchedules
        };
    }
}
