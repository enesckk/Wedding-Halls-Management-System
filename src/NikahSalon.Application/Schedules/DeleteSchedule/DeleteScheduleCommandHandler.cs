using Microsoft.Extensions.Logging;
using NikahSalon.Application.Interfaces;

namespace NikahSalon.Application.Schedules.DeleteSchedule;

public sealed class DeleteScheduleCommandHandler
{
    private readonly IScheduleRepository _repository;
    private readonly ILogger<DeleteScheduleCommandHandler> _logger;

    public DeleteScheduleCommandHandler(
        IScheduleRepository repository,
        ILogger<DeleteScheduleCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<bool> HandleAsync(DeleteScheduleCommand command, CancellationToken ct = default)
    {
        _logger.LogInformation("Deleting schedule with ID: {ScheduleId}", command.Id);

        var schedule = await _repository.GetByIdAsync(command.Id, ct);
        if (schedule == null)
        {
            _logger.LogWarning("Schedule with ID {ScheduleId} not found for deletion", command.Id);
            return false;
        }

        // SuperAdmin tüm schedule'ları silebilir
        // Editor sadece kendi alanındaki (EventType) schedule'ları silebilir
        if (command.CallerRole == "Editor")
        {
            // Editor'ın department'ı olmalı
            if (!command.CallerDepartment.HasValue)
            {
                _logger.LogWarning("Editor user attempted to delete schedule {ScheduleId} but has no department assigned", command.Id);
                throw new UnauthorizedAccessException("Editor kullanıcısının bir alan/departman atanmamış.");
            }
            
            // Schedule'ın EventType'ı Editor'ın department'ı ile eşleşmeli
            if (schedule.EventType != command.CallerDepartment.Value)
            {
                _logger.LogWarning("Editor user {UserId} attempted to delete schedule {ScheduleId} with EventType {ScheduleEventType} but their department is {EditorDepartment}", 
                    command.CallerUserId, command.Id, schedule.EventType, command.CallerDepartment);
                throw new UnauthorizedAccessException("Bu schedule'ı silme yetkiniz bulunmamaktadır. Sadece kendi alanınızdaki etkinlikleri silebilirsiniz.");
            }
        }

        var deleted = await _repository.DeleteAsync(command.Id, ct);
        
        if (deleted)
        {
            _logger.LogInformation(
                "Successfully deleted schedule with ID: {ScheduleId}, HallId: {HallId}, Date: {Date}, Time: {StartTime}-{EndTime}",
                command.Id, schedule.WeddingHallId, schedule.Date, schedule.StartTime, schedule.EndTime);
        }
        else
        {
            _logger.LogError("Failed to delete schedule with ID: {ScheduleId}", command.Id);
        }

        return deleted;
    }
}
