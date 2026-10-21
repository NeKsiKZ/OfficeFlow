using FluentValidation;

namespace OfficeFlow.Application.Reports.Queries.GetManagerStats;

public sealed class GetManagerStatsQueryValidator : AbstractValidator<GetManagerStatsQuery>
{
    public GetManagerStatsQueryValidator()
    {
        RuleFor(query => query)
            .Must(query =>
                query.FromUtc is null ||
                query.ToUtc is null ||
                query.FromUtc < query.ToUtc)
            .WithMessage("fromUtc must be earlier than toUtc.");
    }
}
