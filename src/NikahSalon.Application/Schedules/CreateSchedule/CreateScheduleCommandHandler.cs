using Microsoft.Extensions.Logging;
using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.CreateSchedule;

public sealed class CreateScheduleCommandHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IWeddingHallRepository _hallRepository;
    private readonly ILogger<CreateScheduleCommandHandler> _logger;

    public CreateScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IWeddingHallRepository hallRepository,
        ILogger<CreateScheduleCommandHandler> logger)
    {
        _scheduleRepository = scheduleRepository;
        _hallRepository = hallRepository;
        _logger = logger;
    }

    public async Task<ScheduleDto> HandleAsync(CreateScheduleCommand command, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "Creating schedule for HallId: {HallId}, Date: {Date}, Time: {StartTime}-{EndTime}, Status: {Status}",
            command.WeddingHallId, command.Date, command.StartTime, command.EndTime, command.Status);

        // Verify hall exists
        var hall = await _hallRepository.GetByIdAsync(command.WeddingHallId, ct);
        if (hall == null)
        {
            _logger.LogWarning("Hall with ID {HallId} not found", command.WeddingHallId);
            throw new InvalidOperationException($"Wedding hall with ID {command.WeddingHallId} not found.");
        }

        // Check for overlapping schedules
        var hasOverlap = await _scheduleRepository.ExistsOverlapAsync(
            command.WeddingHallId,
            command.Date,
            command.StartTime,
            command.EndTime,
            null, // No existing schedule to exclude
            ct);

        if (hasOverlap)
        {
            _logger.LogWarning(
                "Schedule overlap detected for HallId: {HallId}, Date: {Date}, Time: {StartTime}-{EndTime}",
                command.WeddingHallId, command.Date, command.StartTime, command.EndTime);
            throw new InvalidOperationException("Schedule overlaps with another slot for the same hall and date.");
        }

        var schedule = new Schedule
        {
            Id = Guid.NewGuid(),
            WeddingHallId = command.WeddingHallId,
            Date = command.Date,
            StartTime = command.StartTime,
            EndTime = command.EndTime,
            Status = command.Status
        };

        var created = await _scheduleRepository.AddAsync(schedule, ct);

        _logger.LogInformation(
            "Successfully created schedule with ID: {ScheduleId}, HallId: {HallId}, Date: {Date}",
            created.Id, created.WeddingHallId, created.Date);

        return new ScheduleDto
        {
            Id = created.Id,
            WeddingHallId = created.WeddingHallId,
            Date = created.Date,
            StartTime = created.StartTime,
            EndTime = created.EndTime,
            Status = created.Status
        };
    }
}
