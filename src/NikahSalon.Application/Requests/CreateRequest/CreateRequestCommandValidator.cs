using FluentValidation;

namespace NikahSalon.Application.Requests.CreateRequest;

public sealed class CreateRequestCommandValidator : AbstractValidator<CreateRequestCommand>
{
    public CreateRequestCommandValidator()
    {
        RuleFor(x => x.WeddingHallId).NotEmpty().WithMessage("WeddingHallId is required.");
        RuleFor(x => x.CreatedByUserId).NotEmpty().WithMessage("CreatedByUserId is required.");
        RuleFor(x => x.Message).NotEmpty().WithMessage("Message is required.");
        RuleFor(x => x.EventType).IsInEnum().WithMessage("EventType is required and must be valid.");
        RuleFor(x => x.EventName).NotEmpty().WithMessage("EventName is required.");
        RuleFor(x => x.EventOwner).NotEmpty().WithMessage("EventOwner is required.");
        RuleFor(x => x.EventDate).NotEmpty().WithMessage("EventDate is required.");
        RuleFor(x => x.EventTime).NotEmpty().WithMessage("EventTime is required.");
    }
}
