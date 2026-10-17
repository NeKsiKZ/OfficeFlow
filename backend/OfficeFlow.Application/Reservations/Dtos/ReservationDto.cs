using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Reservations.Dtos;

public sealed record ReservationDto(
    Guid Id,
    Guid TenantId,
    Guid SpaceId,
    string SpaceName,
    SpaceType SpaceType,
    DateTime StartTimeUtc,
    DateTime EndTimeUtc,
    decimal TotalCostAmount,
    string Currency,
    ReservationStatus Status,
    DateTime CreatedAtUtc,
    string? Notes);
