using MediatR;

namespace OfficeFlow.Application.Reservations.Commands.CancelReservation;

public sealed record CancelReservationCommand(
    Guid Id,
    string ActorRole,
    Guid? ActorTenantId) : IRequest;
