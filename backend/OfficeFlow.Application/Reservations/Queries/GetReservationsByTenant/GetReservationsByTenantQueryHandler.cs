using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Reservations.Dtos;
using OfficeFlow.Application.Reservations.Mappings;

namespace OfficeFlow.Application.Reservations.Queries.GetReservationsByTenant;

public sealed class GetReservationsByTenantQueryHandler
    : IRequestHandler<GetReservationsByTenantQuery, IReadOnlyList<ReservationDto>>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ISpaceRepository _spaceRepository;

    public GetReservationsByTenantQueryHandler(
        IReservationRepository reservationRepository,
        ISpaceRepository spaceRepository)
    {
        _reservationRepository = reservationRepository;
        _spaceRepository = spaceRepository;
    }

    public async Task<IReadOnlyList<ReservationDto>> Handle(
        GetReservationsByTenantQuery request,
        CancellationToken cancellationToken)
    {
        var reservations = await _reservationRepository.GetByTenantIdAsync(
            request.TenantId,
            cancellationToken);

        var results = new List<ReservationDto>(reservations.Count);

        foreach (var reservation in reservations)
        {
            var space = await _spaceRepository.GetByIdAsync(reservation.SpaceId, cancellationToken);
            results.Add(reservation.ToDto(space?.Name));
        }

        return results;
    }
}
