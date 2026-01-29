using FluentValidation;
using NikahSalon.Domain.Enums;

namespace NikahSalon.Application.Schedules.CreateSchedule;

public sealed class CreateScheduleCommandValidator : AbstractValidator<CreateScheduleCommand>
{
    public CreateScheduleCommandValidator()
    {
        RuleFor(x => x.WeddingHallId).NotEmpty().WithMessage("WeddingHallId is required.");
        RuleFor(x => x.Date).NotEmpty().WithMessage("Date is required.");
        RuleFor(x => x.StartTime)
            .Must((cmd, _) => cmd.StartTime < cmd.EndTime)
            .WithMessage("StartTime must be less than EndTime.");
        
        // Dolu schedule'lar için EventName ve EventOwner zorunlu
        RuleFor(x => x.EventName)
            .NotEmpty()
            .When(x => x.Status == ScheduleStatus.Reserved)
            .WithMessage("Dolu schedule'lar için etkinlik adı gereklidir.");
        
        RuleFor(x => x.EventOwner)
            .NotEmpty()
            .When(x => x.Status == ScheduleStatus.Reserved)
            .WithMessage("Dolu schedule'lar için etkinlik sahibi adı gereklidir.");
    }
}
