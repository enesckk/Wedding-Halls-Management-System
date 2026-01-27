using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Halls.CreateHall;

public sealed class CreateHallCommandHandler
{
    private readonly IWeddingHallRepository _hallRepo;
    private readonly IScheduleRepository _scheduleRepo;

    public CreateHallCommandHandler(
        IWeddingHallRepository hallRepo,
        IScheduleRepository scheduleRepo)
    {
        _hallRepo = hallRepo;
        _scheduleRepo = scheduleRepo;
    }

    private static (TimeOnly Start, TimeOnly End) SlotToRange(string slot)
    {
        if (TimeOnly.TryParse(slot, out var start))
        {
            var (h, m) = (start.Hour, start.Minute);
            if (h == 9 && m == 0) return (start, new TimeOnly(10, 0));
            if (h == 10 && m == 30) return (start, new TimeOnly(11, 30));
            if (h == 12 && m == 0) return (start, new TimeOnly(13, 0));
            if (h == 14 && m == 0) return (start, new TimeOnly(15, 0));
            if (h == 15 && m == 30) return (start, new TimeOnly(16, 30));
            if (h == 17 && m == 0) return (start, new TimeOnly(18, 0));
            return (start, start.Add(TimeSpan.FromHours(1)));
        }
        return (default, default);
    }

    public async Task<WeddingHallDto> HandleAsync(CreateHallCommand command, CancellationToken ct = default)
    {
        var entity = new WeddingHall
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            Address = command.Address,
            Capacity = command.Capacity,
            Description = command.Description,
            ImageUrl = command.ImageUrl,
            TechnicalDetails = command.TechnicalDetails
        };
        var created = await _hallRepo.AddAsync(entity, ct);

        if (command.TimeSlots is { Count: > 0 })
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var schedules = new List<Schedule>();
            for (var d = 0; d < 30; d++)
            {
                var date = today.AddDays(d);
                foreach (var slot in command.TimeSlots)
                {
                    var (start, end) = SlotToRange(slot);
                    if (start == default && end == default) continue;
                    schedules.Add(new Schedule
                    {
                        Id = Guid.NewGuid(),
                        WeddingHallId = created.Id,
                        Date = date,
                        StartTime = start,
                        EndTime = end,
                        Status = ScheduleStatus.Available
                    });
                }
            }
            foreach (var s in schedules)
                await _scheduleRepo.AddAsync(s, ct);
        }

        return new WeddingHallDto
        {
            Id = created.Id,
            Name = created.Name,
            Address = created.Address,
            Capacity = created.Capacity,
            Description = created.Description,
            ImageUrl = created.ImageUrl
        };
    }
}
