using MediatR;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Application.Reservations.Commands.CreateReservation;

public sealed class CreateReservationCommandHandler
    : IRequestHandler<CreateReservationCommand, CreateReservationResult>
{
    private readonly ISpaceRepository _spaceRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateReservationCommandHandler(
        ISpaceRepository spaceRepository,
        ITenantRepository tenantRepository,
        IReservationRepository reservationRepository,
        IUnitOfWork unitOfWork)
    {
        _spaceRepository = spaceRepository;
        _tenantRepository = tenantRepository;
        _reservationRepository = reservationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateReservationResult> Handle(
        CreateReservationCommand request,
        CancellationToken cancellationToken)
    {
        var space = await _spaceRepository.GetByIdAsync(request.SpaceId, cancellationToken)
            ?? throw new NotFoundException(nameof(Space), request.SpaceId);

        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Tenant), request.TenantId);

        var period = new DateRange(request.StartTime, request.EndTime);

        // «include» Wyliczanie kosztu najmu — polymorphic pricing from Space (hourly / subscription).
        var totalCost = space.CalculateCost(period);

        var reservation = new Reservation(tenant, space, period);

        await _reservationRepository.AddAsync(reservation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateReservationResult(
            reservation.Id,
            reservation.SpaceId,
            reservation.TenantId,
            reservation.Period.StartUtc,
            reservation.Period.EndUtc,
            totalCost.Amount,
            totalCost.Currency,
            reservation.Status);
    }
}
