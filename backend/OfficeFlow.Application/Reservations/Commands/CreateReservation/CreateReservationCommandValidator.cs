using FluentValidation;

namespace OfficeFlow.Application.Reservations.Commands.CreateReservation;

public sealed class CreateReservationCommandValidator : AbstractValidator<CreateReservationCommand>
{
    public CreateReservationCommandValidator()
    {
        RuleFor(command => command.SpaceId)
            .NotEmpty();

        RuleFor(command => command.TenantId)
            .NotEmpty();

        RuleFor(command => command.StartTime)
            .NotEmpty();

        RuleFor(command => command.EndTime)
            .NotEmpty()
            .GreaterThan(command => command.StartTime)
            .WithMessage("EndTime must be greater than StartTime.");
    }
}
