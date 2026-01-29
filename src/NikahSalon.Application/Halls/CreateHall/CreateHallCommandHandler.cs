using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Domain.Enums;
using System.Text.RegularExpressions;

namespace NikahSalon.Application.Halls.CreateHall;

public sealed class CreateHallCommandHandler
{
    private readonly IWeddingHallRepository _hallRepo;
    private readonly IScheduleRepository _scheduleRepo;
    private readonly IHallAccessRepository _hallAccessRepo;
    private readonly ICenterRepository _centerRepo;

    public CreateHallCommandHandler(
        IWeddingHallRepository hallRepo,
        IScheduleRepository scheduleRepo,
        IHallAccessRepository hallAccessRepo,
        ICenterRepository centerRepo)
    {
        _hallRepo = hallRepo;
        _scheduleRepo = scheduleRepo;
        _hallAccessRepo = hallAccessRepo;
        _centerRepo = centerRepo;
    }

    private static List<Guid> ParseAllowedUserIds(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return new List<Guid>();

        // "Erişim İzni Olan Editörler: [id1,id2,id3]" formatını parse et
        var match = Regex.Match(description, @"Erişim İzni Olan Editörler:\s*\[([^\]]+)\]");
        if (!match.Success)
            return new List<Guid>();

        var idsString = match.Groups[1].Value;
        var ids = idsString.Split(',')
            .Select(id => id.Trim())
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Where(id => Guid.TryParse(id, out _))
            .Select(Guid.Parse)
            .ToList();

        return ids;
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
            CenterId = command.CenterId,
            Name = command.Name,
            Address = command.Address,
            Capacity = command.Capacity,
            Description = command.Description,
            ImageUrl = command.ImageUrl,
            TechnicalDetails = command.TechnicalDetails
        };
        var created = await _hallRepo.AddAsync(entity, ct);

        // Erişim izinlerini ekle (hem command'dan gelen hem de merkeze erişim izni olan editörler)
        var allAllowedUserIds = new HashSet<Guid>();
        
        // Command'dan gelen erişim izinleri (şu anda kullanılmıyor ama gelecekte kullanılabilir)
        if (command.AllowedUserIds is { Count: > 0 })
        {
            foreach (var userId in command.AllowedUserIds)
            {
                allAllowedUserIds.Add(userId);
            }
        }

        // Merkeze erişim izni olan editörler için de erişim izni ver
        if (command.CenterId != Guid.Empty)
        {
            var center = await _centerRepo.GetByIdAsync(command.CenterId, ct);
            if (center != null)
            {
                var centerAllowedUserIds = ParseAllowedUserIds(center.Description);
                foreach (var userId in centerAllowedUserIds)
                {
                    allAllowedUserIds.Add(userId);
                }
            }
        }

        // Tüm erişim izinlerini HallAccesses tablosuna ekle
        if (allAllowedUserIds.Count > 0)
        {
            var accesses = allAllowedUserIds.Select(userId => new HallAccess
            {
                Id = Guid.NewGuid(),
                HallId = created.Id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            }).ToList();
            
            await _hallAccessRepo.AddRangeAsync(accesses, ct);
        }

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
            CenterId = created.CenterId,
            Name = created.Name,
            Address = created.Address,
            Capacity = created.Capacity,
            Description = created.Description,
            ImageUrl = created.ImageUrl,
            TechnicalDetails = created.TechnicalDetails
        };
    }
}
