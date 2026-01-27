using FluentValidation;

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
    }
}
