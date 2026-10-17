using FluentValidation;

namespace OfficeFlow.Application.Reservations.Commands.ConfirmReservation;

public sealed class ConfirmReservationCommandValidator
    : AbstractValidator<ConfirmReservationCommand>
{
    public ConfirmReservationCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
    }
}
