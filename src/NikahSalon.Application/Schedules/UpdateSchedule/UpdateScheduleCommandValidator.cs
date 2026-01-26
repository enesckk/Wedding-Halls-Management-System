using FluentValidation;

namespace NikahSalon.Application.Schedules.UpdateSchedule;

public sealed class UpdateScheduleCommandValidator : AbstractValidator<UpdateScheduleCommand>
{
    public UpdateScheduleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(x => x.WeddingHallId).NotEmpty().WithMessage("WeddingHallId is required.");
        RuleFor(x => x.StartTime)
            .Must((cmd, _) => cmd.StartTime < cmd.EndTime)
            .WithMessage("StartTime must be less than EndTime.");
    }
}
