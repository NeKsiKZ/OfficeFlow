using FluentValidation;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Spaces.Commands.CreateSpace;

public sealed class CreateSpaceCommandValidator : AbstractValidator<CreateSpaceCommand>
{
    public CreateSpaceCommandValidator()
    {
        RuleFor(command => command.Name).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Code).NotEmpty().MaximumLength(50);
        RuleFor(command => command.Type).IsInEnum();
        RuleFor(command => command.Currency).NotEmpty().Length(3);

        When(command => command.Type is SpaceType.Desk or SpaceType.ParkingSpace, () =>
        {
            RuleFor(command => command.HourlyRate)
                .NotNull()
                .GreaterThan(0);
        });

        When(command => command.Type == SpaceType.Room, () =>
        {
            RuleFor(command => command.MonthlySubscriptionRate)
                .NotNull()
                .GreaterThan(0);

            RuleFor(command => command.AreaSquareMeters)
                .NotNull()
                .GreaterThan(0);

            RuleFor(command => command.Capacity)
                .NotNull()
                .GreaterThan(0);
        });

        When(command => command.Type == SpaceType.ParkingSpace, () =>
        {
            RuleFor(command => command.SpotNumber).NotEmpty().MaximumLength(50);
        });
    }
}
