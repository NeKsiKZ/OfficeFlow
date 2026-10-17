using FluentValidation;

namespace OfficeFlow.Application.Spaces.Queries.GetSpaceById;

public sealed class GetSpaceByIdQueryValidator : AbstractValidator<GetSpaceByIdQuery>
{
    public GetSpaceByIdQueryValidator()
    {
        RuleFor(query => query.Id).NotEmpty();
    }
}
