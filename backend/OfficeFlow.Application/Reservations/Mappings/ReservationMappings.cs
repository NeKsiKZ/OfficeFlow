using OfficeFlow.Application.Reservations.Dtos;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Reservations.Mappings;

public static class ReservationMappings
{
    public static ReservationDto ToDto(this Reservation reservation) =>
        new(
            reservation.Id,
            reservation.TenantId,
            reservation.SpaceId,
            reservation.SpaceType,
            reservation.Period.StartUtc,
            reservation.Period.EndUtc,
            reservation.TotalCost.Amount,
            reservation.TotalCost.Currency,
            reservation.Status,
            reservation.CreatedAtUtc,
            reservation.Notes);
}
