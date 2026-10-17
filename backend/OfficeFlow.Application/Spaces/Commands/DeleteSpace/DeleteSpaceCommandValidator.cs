using FluentValidation;

namespace OfficeFlow.Application.Spaces.Commands.DeleteSpace;

public sealed class DeleteSpaceCommandValidator : AbstractValidator<DeleteSpaceCommand>
{
    public DeleteSpaceCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
    }
}
