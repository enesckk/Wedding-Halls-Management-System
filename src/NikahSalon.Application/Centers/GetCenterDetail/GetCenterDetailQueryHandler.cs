using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Centers.GetCenterDetail;

public sealed class GetCenterDetailQueryHandler
{
    private readonly ICenterRepository _centerRepository;
    private readonly IWeddingHallRepository _hallRepository;
    private readonly IScheduleRepository _scheduleRepository;

    public GetCenterDetailQueryHandler(
        ICenterRepository centerRepository,
        IWeddingHallRepository hallRepository,
        IScheduleRepository scheduleRepository)
    {
        _centerRepository = centerRepository;
        _hallRepository = hallRepository;
        _scheduleRepository = scheduleRepository;
    }

    public async Task<CenterDetailDto?> HandleAsync(GetCenterDetailQuery query, CancellationToken ct = default)
    {
        var center = await _centerRepository.GetByIdAsync(query.Id, ct);
        if (center is null) return null;

        // Bu merkeze ait tüm salonları getir
        var allHalls = await _hallRepository.GetAllAsync(ct);
        var centerHalls = allHalls.Where(h => h.CenterId == center.Id).ToList();

        // Her salon için schedule'ları getir
        var hallsWithSchedules = new List<HallWithSchedulesDto>();
        foreach (var hall in centerHalls)
        {
            var schedules = await _scheduleRepository.GetByHallIdAsync(hall.Id, ct);
            hallsWithSchedules.Add(new HallWithSchedulesDto
            {
                Id = hall.Id,
                Name = hall.Name,
                Address = hall.Address,
                Capacity = hall.Capacity,
                Description = hall.Description,
                ImageUrl = hall.ImageUrl,
                TechnicalDetails = hall.TechnicalDetails,
                Schedules = schedules.Select(s => new CenterScheduleDto
                {
                    Id = s.Id,
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Status = s.Status == ScheduleStatus.Available ? 0 : 1,
                    EventType = s.EventType.HasValue ? (int)s.EventType.Value : null,
                    EventName = s.EventName,
                    EventOwner = s.EventOwner
                }).ToList()
            });
        }

        return new CenterDetailDto
        {
            Id = center.Id,
            Name = center.Name,
            Address = center.Address,
            Description = center.Description,
            ImageUrl = center.ImageUrl,
            CreatedAt = center.CreatedAt,
            Halls = hallsWithSchedules
        };
    }
}
