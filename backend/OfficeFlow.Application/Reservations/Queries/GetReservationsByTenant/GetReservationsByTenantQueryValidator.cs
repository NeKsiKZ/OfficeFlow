using FluentValidation;

namespace OfficeFlow.Application.Reservations.Queries.GetReservationsByTenant;

public sealed class GetReservationsByTenantQueryValidator
    : AbstractValidator<GetReservationsByTenantQuery>
{
    public GetReservationsByTenantQueryValidator()
    {
        RuleFor(query => query.TenantId).NotEmpty();
    }
}
