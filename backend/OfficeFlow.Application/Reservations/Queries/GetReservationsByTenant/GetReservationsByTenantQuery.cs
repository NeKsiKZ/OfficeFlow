using MediatR;
using OfficeFlow.Application.Reservations.Dtos;

namespace OfficeFlow.Application.Reservations.Queries.GetReservationsByTenant;

public sealed record GetReservationsByTenantQuery(Guid TenantId)
    : IRequest<IReadOnlyList<ReservationDto>>;
