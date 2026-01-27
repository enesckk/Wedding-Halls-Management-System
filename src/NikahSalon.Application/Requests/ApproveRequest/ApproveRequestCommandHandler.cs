using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Requests.ApproveRequest;

public sealed class ApproveRequestCommandHandler
{
    private readonly IRequestRepository _requestRepo;
    private readonly IScheduleRepository _scheduleRepo;

    public ApproveRequestCommandHandler(
        IRequestRepository requestRepo,
        IScheduleRepository scheduleRepo)
    {
        _requestRepo = requestRepo;
        _scheduleRepo = scheduleRepo;
    }

    /// <summary>
    /// Slot başlangıç saatine göre bitiş saati (1 saatlik slotlar).
    /// </summary>
    private static TimeOnly SlotEnd(TimeOnly start)
    {
        var (h, m) = (start.Hour, start.Minute);
        if (h == 9 && m == 0) return new TimeOnly(10, 0);
        if (h == 10 && m == 30) return new TimeOnly(11, 30);
        if (h == 12 && m == 0) return new TimeOnly(13, 0);
        if (h == 14 && m == 0) return new TimeOnly(15, 0);
        if (h == 15 && m == 30) return new TimeOnly(16, 30);
        if (h == 17 && m == 0) return new TimeOnly(18, 0);
        return start.Add(TimeSpan.FromHours(1));
    }

    public async Task<RequestDto?> HandleAsync(ApproveRequestCommand command, CancellationToken ct = default)
    {
        var entity = await _requestRepo.GetByIdForUpdateAsync(command.Id, ct);
        if (entity is null) return null;
        if (entity.Status != RequestStatus.Pending)
            throw new InvalidOperationException("Sadece bekleyen talepler onaylanabilir.");

        var start = entity.EventTime;
        var end = SlotEnd(start);

        var overlap = await _scheduleRepo.ExistsOverlapAsync(
            entity.WeddingHallId,
            entity.EventDate,
            start,
            end,
            null,
            ct);
        if (overlap)
            throw new InvalidOperationException("Bu saat aralığı bu salonda dolu. Talep onaylanamıyor.");

        var schedule = new Schedule
        {
            Id = Guid.NewGuid(),
            WeddingHallId = entity.WeddingHallId,
            Date = entity.EventDate,
            StartTime = start,
            EndTime = end,
            Status = ScheduleStatus.Reserved
        };
        await _scheduleRepo.AddAsync(schedule, ct);

        entity.Status = RequestStatus.Answered;
        await _requestRepo.UpdateAsync(entity, ct);

        return new RequestDto
        {
            Id = entity.Id,
            WeddingHallId = entity.WeddingHallId,
            CreatedByUserId = entity.CreatedByUserId,
            Message = entity.Message,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
            EventType = entity.EventType,
            EventName = entity.EventName,
            EventOwner = entity.EventOwner,
            EventDate = entity.EventDate,
            EventTime = entity.EventTime
        };
    }
}
