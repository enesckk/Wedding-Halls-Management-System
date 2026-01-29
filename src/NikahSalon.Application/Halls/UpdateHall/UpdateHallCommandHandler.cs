using NikahSalon.Application.DTOs;
using NikahSalon.Application.Interfaces;
using NikahSalon.Domain.Entities;

namespace NikahSalon.Application.Halls.UpdateHall;

public sealed class UpdateHallCommandHandler
{
    private readonly IWeddingHallRepository _repository;
    private readonly IHallAccessRepository _hallAccessRepo;

    public UpdateHallCommandHandler(
        IWeddingHallRepository repository,
        IHallAccessRepository hallAccessRepo)
    {
        _repository = repository;
        _hallAccessRepo = hallAccessRepo;
    }

    public async Task<WeddingHallDto?> HandleAsync(UpdateHallCommand command, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(command.Id, ct);
        if (existing is null) return null;
        existing.CenterId = command.CenterId;
        existing.Name = command.Name;
        existing.Address = command.Address;
        existing.Capacity = command.Capacity;
        existing.Description = command.Description;
        existing.ImageUrl = command.ImageUrl;
        existing.TechnicalDetails = command.TechnicalDetails;
        await _repository.UpdateAsync(existing, ct);

        // Erişim izinlerini güncelle
        // Önce mevcut erişimleri sil
        await _hallAccessRepo.RemoveByHallIdAsync(command.Id, ct);
        
        // Yeni erişim izinlerini ekle
        if (command.AllowedUserIds is { Count: > 0 })
        {
            var accesses = command.AllowedUserIds.Select(userId => new HallAccess
            {
                Id = Guid.NewGuid(),
                HallId = command.Id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            }).ToList();
            
            await _hallAccessRepo.AddRangeAsync(accesses, ct);
        }
        return new WeddingHallDto
        {
            Id = existing.Id,
            CenterId = existing.CenterId,
            Name = existing.Name,
            Address = existing.Address,
            Capacity = existing.Capacity,
            Description = existing.Description,
            ImageUrl = existing.ImageUrl,
            TechnicalDetails = existing.TechnicalDetails
        };
    }
}
