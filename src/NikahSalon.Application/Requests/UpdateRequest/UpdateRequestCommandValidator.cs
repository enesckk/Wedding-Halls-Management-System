using FluentValidation;

namespace NikahSalon.Application.Requests.UpdateRequest;

public sealed class UpdateRequestCommandValidator : AbstractValidator<UpdateRequestCommand>
{
    public UpdateRequestCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(x => x.CallerUserId).NotEmpty().WithMessage("CallerUserId is required.");
        RuleFor(x => x.CallerRole).NotEmpty().WithMessage("CallerRole is required.");

        RuleFor(x => x.WeddingHallId).NotEmpty().WithMessage("WeddingHallId is required.");
        RuleFor(x => x.EventType).IsInEnum().WithMessage("EventType is required and must be valid.");
        RuleFor(x => x.EventName).NotEmpty().WithMessage("EventName is required.");
        RuleFor(x => x.EventOwner).NotEmpty().WithMessage("EventOwner is required.");
        RuleFor(x => x.EventDate).NotEmpty().WithMessage("EventDate is required.");
        RuleFor(x => x.EventTime).NotEmpty().WithMessage("EventTime is required.");

        RuleFor(x => x.Message).MaximumLength(1000).WithMessage("Message must be at most 1000 characters.");
        RuleFor(x => x.EventName).MaximumLength(200).WithMessage("EventName must be at most 200 characters.");
        RuleFor(x => x.EventOwner).MaximumLength(200).WithMessage("EventOwner must be at most 200 characters.");
    }
}

