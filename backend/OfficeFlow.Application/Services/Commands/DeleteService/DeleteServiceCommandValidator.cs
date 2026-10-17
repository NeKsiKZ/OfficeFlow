using FluentValidation;

namespace OfficeFlow.Application.Services.Commands.DeleteService;

public sealed class DeleteServiceCommandValidator : AbstractValidator<DeleteServiceCommand>
{
    public DeleteServiceCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
    }
}
