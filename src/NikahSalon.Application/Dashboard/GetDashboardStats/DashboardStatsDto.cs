namespace NikahSalon.Application.Dashboard.GetDashboardStats;

public sealed class DashboardStatsDto
{
    public required int TotalHalls { get; init; }
    public required int TotalRequests { get; init; }
    public required int TotalSchedules { get; init; }
    public required int PendingRequests { get; init; }
    public required int AnsweredRequests { get; init; }
    public required int AvailableSchedules { get; init; }
    public required int ReservedSchedules { get; init; }
}
