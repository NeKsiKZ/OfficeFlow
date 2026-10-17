using FluentValidation;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Services.Commands.CreateService;

public sealed class CreateServiceCommandValidator : AbstractValidator<CreateServiceCommand>
{
    public CreateServiceCommandValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(command => command.Price)
            .GreaterThan(0);

        RuleFor(command => command.Description)
            .MaximumLength(1000)
            .When(command => command.Description is not null);

        RuleFor(command => command.Currency)
            .NotEmpty()
            .Length(3);

        RuleFor(command => command.ApplicableSpaceTypes)
            .NotNull()
            .Must(types => types.Count > 0)
            .WithMessage("Select at least one applicable space type.")
            .Must(types => types.All(type => Enum.IsDefined(typeof(SpaceType), type)))
            .WithMessage("One or more space types are invalid.");
    }
}
