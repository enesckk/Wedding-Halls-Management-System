using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.UpdateSchedule;

public sealed class UpdateScheduleCommandHandler
{
    private readonly IScheduleRepository _repository;
    private readonly IWeddingHallRepository _hallRepository;
    private readonly IHallAccessRepository _hallAccessRepository;

    public UpdateScheduleCommandHandler(
        IScheduleRepository repository,
        IWeddingHallRepository hallRepository,
        IHallAccessRepository hallAccessRepository)
    {
        _repository = repository;
        _hallRepository = hallRepository;
        _hallAccessRepository = hallAccessRepository;
    }

    public async Task<ScheduleDto?> HandleAsync(UpdateScheduleCommand command, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(command.Id, ct);
        if (existing is null) return null;

        // SuperAdmin tüm schedule'ları güncelleyebilir
        // Editor için erişim kontrolü
        if (command.CallerRole == "Editor" && command.CallerUserId.HasValue)
        {
            // 1. Merkez erişim kontrolü: Editor'ın salonun merkezine erişim izni olmalı
            var hasAccess = await _hallAccessRepository.HasAccessAsync(command.WeddingHallId, command.CallerUserId.Value, ct);
            if (!hasAccess)
            {
                throw new UnauthorizedAccessException("Bu salona rezervasyon yapma yetkiniz bulunmamaktadır.");
            }

            // 2. EventType kontrolü: Sadece "Reserved" schedule'lar için ve EventType varsa kontrol yap
            // "Available" schedule'lar için EventType kontrolü yapılmaz (çünkü Editor yeni rezervasyon oluşturabilir)
            if (existing.Status == ScheduleStatus.Reserved && existing.EventType.HasValue)
            {
                // Editor'ın department'ı olmalı
                if (!command.CallerDepartment.HasValue)
                {
                    throw new UnauthorizedAccessException("Editor kullanıcısının bir alan/departman atanmamış.");
                }
                
                // Mevcut schedule'ın EventType'ı Editor'ın department'ı ile eşleşmeli
                if (existing.EventType.Value != command.CallerDepartment.Value)
                {
                    throw new UnauthorizedAccessException("Bu etkinliği düzenleme yetkiniz bulunmamaktadır. Sadece kendi alanınızdaki etkinlikleri düzenleyebilirsiniz.");
                }
            }
            
            // 3. Yeni EventType eklenirken (Available -> Reserved), yeni EventType Editor'ın department'ı ile eşleşmeli
            if (existing.Status == ScheduleStatus.Available && command.Status == ScheduleStatus.Reserved && command.EventType.HasValue)
            {
                // Editor'ın department'ı olmalı
                if (!command.CallerDepartment.HasValue)
                {
                    throw new UnauthorizedAccessException("Editor kullanıcısının bir alan/departman atanmamış.");
                }
                
                // Yeni EventType Editor'ın department'ı ile eşleşmeli
                if (command.EventType.Value != command.CallerDepartment.Value)
                {
                    throw new UnauthorizedAccessException("Bu etkinlik tipini oluşturma yetkiniz bulunmamaktadır. Sadece kendi alanınızdaki etkinlikleri oluşturabilirsiniz.");
                }
            }
        }

        var hasOverlap = await _repository.ExistsOverlapAsync(
            command.WeddingHallId,
            command.Date,
            command.StartTime,
            command.EndTime,
            command.Id,
            ct);
        if (hasOverlap)
            throw new InvalidOperationException("Bu saat aralığında aynı salon ve tarih için başka bir rezervasyon bulunmaktadır.");

        existing.WeddingHallId = command.WeddingHallId;
        existing.Date = command.Date;
        existing.StartTime = command.StartTime;
        existing.EndTime = command.EndTime;
        existing.Status = command.Status;
        existing.EventType = command.EventType;
        existing.EventName = command.EventName;
        existing.EventOwner = command.EventOwner;
        await _repository.UpdateAsync(existing, ct);

        return new ScheduleDto
        {
            Id = existing.Id,
            WeddingHallId = existing.WeddingHallId,
            Date = existing.Date,
            StartTime = existing.StartTime,
            EndTime = existing.EndTime,
            Status = existing.Status,
            CreatedByUserId = existing.CreatedByUserId,
            EventType = existing.EventType,
            EventName = existing.EventName,
            EventOwner = existing.EventOwner
        };
    }
}
