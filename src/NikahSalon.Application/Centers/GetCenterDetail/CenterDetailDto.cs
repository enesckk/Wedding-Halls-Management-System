namespace NikahSalon.Application.Centers.GetCenterDetail;

public sealed class CenterDetailDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public IReadOnlyList<HallWithSchedulesDto> Halls { get; init; } = Array.Empty<HallWithSchedulesDto>();
}

public sealed class HallWithSchedulesDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public string Description { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public string TechnicalDetails { get; init; } = string.Empty;
    public IReadOnlyList<CenterScheduleDto> Schedules { get; init; } = Array.Empty<CenterScheduleDto>();
}

public sealed class CenterScheduleDto
{
    public Guid Id { get; init; }
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public int Status { get; init; } // 0=Available, 1=Reserved
    public int? EventType { get; init; }
    public string? EventName { get; init; }
    public string? EventOwner { get; init; }
}
