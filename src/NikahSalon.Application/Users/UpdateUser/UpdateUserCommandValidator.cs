using FluentValidation;

namespace NikahSalon.Application.Users.UpdateUser;

public sealed class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");

        When(x => !string.IsNullOrWhiteSpace(x.Email), () =>
        {
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.FullName), () =>
        {
            RuleFor(x => x.FullName)
                .MaximumLength(200).WithMessage("FullName must not exceed 200 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Role), () =>
        {
            RuleFor(x => x.Role)
                .Must(role => role == "Viewer" || role == "Editor")
                .WithMessage("Role must be either 'Viewer' or 'Editor'.");
        });
    }
}
