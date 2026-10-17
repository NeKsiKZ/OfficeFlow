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

        RuleFor(command => command)
            .Must(command => command.EndTime - command.StartTime <= TimeSpan.FromDays(800))
            .WithMessage("Reservation period is unreasonably long.")
            .When(command => command.EndTime > command.StartTime);

        RuleForEach(command => command.ServiceIds)
            .NotEmpty()
            .When(command => command.ServiceIds is not null);
    }
}
