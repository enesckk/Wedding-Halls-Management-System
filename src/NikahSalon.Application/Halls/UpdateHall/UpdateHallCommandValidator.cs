using FluentValidation;

namespace NikahSalon.Application.Halls.UpdateHall;

public sealed class UpdateHallCommandValidator : AbstractValidator<UpdateHallCommand>
{
    public UpdateHallCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Address).NotEmpty().WithMessage("Address is required.");
        RuleFor(x => x.Capacity).GreaterThan(0).WithMessage("Capacity must be greater than 0.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description is required.");
    }
}
