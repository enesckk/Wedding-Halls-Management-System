using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Schedules.UpdateSchedule;

public sealed class UpdateScheduleCommandHandler
{
    private readonly IScheduleRepository _repository;

    public UpdateScheduleCommandHandler(IScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<ScheduleDto?> HandleAsync(UpdateScheduleCommand command, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(command.Id, ct);
        if (existing is null) return null;

        var hasOverlap = await _repository.ExistsOverlapAsync(
            command.WeddingHallId,
            command.Date,
            command.StartTime,
            command.EndTime,
            command.Id,
            ct);
        if (hasOverlap)
            throw new InvalidOperationException("Schedule overlaps with another slot for the same hall and date.");

        existing.WeddingHallId = command.WeddingHallId;
        existing.Date = command.Date;
        existing.StartTime = command.StartTime;
        existing.EndTime = command.EndTime;
        existing.Status = command.Status;
        await _repository.UpdateAsync(existing, ct);

        return new ScheduleDto
        {
            Id = existing.Id,
            WeddingHallId = existing.WeddingHallId,
            Date = existing.Date,
            StartTime = existing.StartTime,
            EndTime = existing.EndTime,
            Status = existing.Status
        };
    }
}
