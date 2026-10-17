using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Reservations.Dtos;
using OfficeFlow.Application.Reservations.Mappings;

namespace OfficeFlow.Application.Reservations.Queries.GetReservationsByTenant;

public sealed class GetReservationsByTenantQueryHandler
    : IRequestHandler<GetReservationsByTenantQuery, IReadOnlyList<ReservationDto>>
{
    private readonly IReservationRepository _reservationRepository;

    public GetReservationsByTenantQueryHandler(IReservationRepository reservationRepository)
    {
        _reservationRepository = reservationRepository;
    }

    public async Task<IReadOnlyList<ReservationDto>> Handle(
        GetReservationsByTenantQuery request,
        CancellationToken cancellationToken)
    {
        var reservations = await _reservationRepository.GetByTenantIdAsync(
            request.TenantId,
            cancellationToken);

        return reservations.Select(reservation => reservation.ToDto()).ToList();
    }
}
