namespace NikahSalon.Application.Dashboard.GetRequestsSummary;

public sealed class RequestsSummaryDto
{
    public required int Total { get; init; }
    public required int Pending { get; init; }
    public required int Answered { get; init; }
}
