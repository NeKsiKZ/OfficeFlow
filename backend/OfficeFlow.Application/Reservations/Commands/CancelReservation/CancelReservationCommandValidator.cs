using FluentValidation;
using OfficeFlow.Application.Common.Security;

namespace OfficeFlow.Application.Reservations.Commands.CancelReservation;

public sealed class CancelReservationCommandValidator
    : AbstractValidator<CancelReservationCommand>
{
    public CancelReservationCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();

        RuleFor(command => command.ActorRole)
            .NotEmpty()
            .Must(role => role is Roles.Manager or Roles.Tenant)
            .WithMessage("Actor role must be Manager or Tenant.");

        RuleFor(command => command.ActorTenantId)
            .NotEmpty()
            .When(command => command.ActorRole == Roles.Tenant)
            .WithMessage("Tenant id is required for tenant actors.");
    }
}
