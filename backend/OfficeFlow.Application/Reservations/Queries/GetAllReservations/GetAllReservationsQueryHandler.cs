using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Reservations.Dtos;
using OfficeFlow.Application.Reservations.Mappings;

namespace OfficeFlow.Application.Reservations.Queries.GetAllReservations;

public sealed class GetAllReservationsQueryHandler
    : IRequestHandler<GetAllReservationsQuery, IReadOnlyList<ReservationDto>>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ISpaceRepository _spaceRepository;

    public GetAllReservationsQueryHandler(
        IReservationRepository reservationRepository,
        ISpaceRepository spaceRepository)
    {
        _reservationRepository = reservationRepository;
        _spaceRepository = spaceRepository;
    }

    public async Task<IReadOnlyList<ReservationDto>> Handle(
        GetAllReservationsQuery request,
        CancellationToken cancellationToken)
    {
        var reservations = await _reservationRepository.GetAllAsync(cancellationToken);
        var results = new List<ReservationDto>(reservations.Count);

        foreach (var reservation in reservations)
        {
            var space = await _spaceRepository.GetByIdAsync(reservation.SpaceId, cancellationToken);
            results.Add(reservation.ToDto(space?.Name));
        }

        return results;
    }
}
