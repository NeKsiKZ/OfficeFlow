using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Reports.Dtos;

namespace OfficeFlow.Application.Reports.Queries.GetManagerStats;

public sealed class GetManagerStatsQueryHandler
    : IRequestHandler<GetManagerStatsQuery, ManagerStatsDto>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ISpaceRepository _spaceRepository;

    public GetManagerStatsQueryHandler(
        IReservationRepository reservationRepository,
        ISpaceRepository spaceRepository)
    {
        _reservationRepository = reservationRepository;
        _spaceRepository = spaceRepository;
    }

    public async Task<ManagerStatsDto> Handle(
        GetManagerStatsQuery request,
        CancellationToken cancellationToken)
    {
        var periodReservations = await _reservationRepository.GetForReportingAsync(
            request.FromUtc,
            request.ToUtc,
            cancellationToken);

        // Pending queue and live occupancy must ignore the revenue date filter.
        var liveReservations = await _reservationRepository.GetAllAsync(cancellationToken);

        var spaces = await _spaceRepository.GetAllAsync(cancellationToken: cancellationToken);

        return ManagerStatsCalculator.Calculate(
            periodReservations,
            liveReservations,
            spaces,
            DateTime.UtcNow,
            request.FromUtc,
            request.ToUtc);
    }
}
