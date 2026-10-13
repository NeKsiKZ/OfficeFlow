using FluentValidation;

namespace OfficeFlow.Application.Tenants.Commands.CreateTenant;

public sealed class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(command => command.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(command => command.LastName).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(command => command.PhoneNumber).MaximumLength(50).When(command => command.PhoneNumber is not null);
        RuleFor(command => command.CompanyName).MaximumLength(200).When(command => command.CompanyName is not null);
    }
}
