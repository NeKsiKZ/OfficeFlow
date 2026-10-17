using MediatR;

namespace OfficeFlow.Application.Reservations.Commands.CreateReservation;

public sealed record CreateReservationCommand(
    Guid SpaceId,
    Guid TenantId,
    DateTime StartTime,
    DateTime EndTime,
    IReadOnlyList<Guid>? ServiceIds = null) : IRequest<CreateReservationResult>;
