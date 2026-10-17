using OfficeFlow.Application.Reservations.Dtos;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Reservations.Mappings;

public static class ReservationMappings
{
    public static ReservationDto ToDto(this Reservation reservation, string? spaceName = null) =>
        new(
            reservation.Id,
            reservation.TenantId,
            reservation.SpaceId,
            spaceName ?? reservation.SpaceId.ToString(),
            reservation.SpaceType,
            reservation.Period.StartUtc,
            reservation.Period.EndUtc,
            reservation.TotalCost.Amount,
            reservation.TotalCost.Currency,
            reservation.Status,
            reservation.CreatedAtUtc,
            reservation.Notes);
}
