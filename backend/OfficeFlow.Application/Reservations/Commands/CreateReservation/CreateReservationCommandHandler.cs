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
    private readonly IAdditionalServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateReservationCommandHandler(
        ISpaceRepository spaceRepository,
        ITenantRepository tenantRepository,
        IReservationRepository reservationRepository,
        IAdditionalServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _spaceRepository = spaceRepository;
        _tenantRepository = tenantRepository;
        _reservationRepository = reservationRepository;
        _serviceRepository = serviceRepository;
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

        var serviceIds = request.ServiceIds?.Distinct().ToList() ?? [];
        var services = serviceIds.Count == 0
            ? []
            : await _serviceRepository.GetByIdsAsync(serviceIds, cancellationToken);

        if (services.Count != serviceIds.Count)
        {
            var foundIds = services.Select(service => service.Id).ToHashSet();
            var missingId = serviceIds.First(id => !foundIds.Contains(id));
            throw new NotFoundException(nameof(AdditionalService), missingId);
        }

        var period = new DateRange(request.StartTime, request.EndTime);

        // Space cost + selected add-on services (parking, media, storage, …).
        var reservation = new Reservation(tenant, space, period, services);

        await _reservationRepository.AddAsync(reservation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateReservationResult(
            reservation.Id,
            reservation.SpaceId,
            reservation.TenantId,
            reservation.Period.StartUtc,
            reservation.Period.EndUtc,
            reservation.TotalCost.Amount,
            reservation.TotalCost.Currency,
            reservation.Status);
    }
}
