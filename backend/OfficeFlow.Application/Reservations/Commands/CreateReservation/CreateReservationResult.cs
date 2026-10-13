using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Reservations.Commands.CreateReservation;

public sealed record CreateReservationResult(
    Guid ReservationId,
    Guid SpaceId,
    Guid TenantId,
    DateTime StartTimeUtc,
    DateTime EndTimeUtc,
    decimal TotalCostAmount,
    string Currency,
    ReservationStatus Status);
