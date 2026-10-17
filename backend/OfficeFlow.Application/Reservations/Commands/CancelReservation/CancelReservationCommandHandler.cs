using MediatR;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Common.Security;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Exceptions;

namespace OfficeFlow.Application.Reservations.Commands.CancelReservation;

public sealed class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelReservationCommandHandler(
        IReservationRepository reservationRepository,
        IUnitOfWork unitOfWork)
    {
        _reservationRepository = reservationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetTrackedByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Reservation), request.Id);

        if (request.ActorRole == Roles.Tenant)
        {
            if (request.ActorTenantId is null || reservation.TenantId != request.ActorTenantId)
            {
                throw new UnauthorizedAccessException(
                    "Tenants can only cancel their own reservations.");
            }
        }
        else if (request.ActorRole != Roles.Manager)
        {
            throw new DomainException("Only Manager or Tenant can cancel a reservation.");
        }

        reservation.Cancel();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
