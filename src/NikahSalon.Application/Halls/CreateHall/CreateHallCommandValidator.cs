using FluentValidation;

namespace NikahSalon.Application.Halls.CreateHall;

public sealed class CreateHallCommandValidator : AbstractValidator<CreateHallCommand>
{
    public CreateHallCommandValidator()
    {
        RuleFor(x => x.CenterId).NotEmpty().WithMessage("CenterId is required.");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Address).NotEmpty().WithMessage("Address is required.");
        RuleFor(x => x.Capacity).GreaterThan(0).WithMessage("Capacity must be greater than 0.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description is required.");
    }
}
