namespace NikahSalon.Application.Dashboard.GetSchedulesSummary;

public sealed class SchedulesSummaryDto
{
    public required int Total { get; init; }
    public required int Available { get; init; }
    public required int Reserved { get; init; }
}
