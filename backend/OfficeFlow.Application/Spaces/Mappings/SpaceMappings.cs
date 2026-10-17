using OfficeFlow.Application.Spaces.Dtos;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Spaces.Mappings;

public static class SpaceMappings
{
    public static SpaceDto ToDto(this Space space) =>
        space switch
        {
            Desk desk => new SpaceDto(
                desk.Id,
                desk.Name,
                desk.Code,
                desk.Type,
                desk.IsActive,
                desk.Description,
                desk.HourlyRate.Amount,
                null,
                desk.HourlyRate.Currency,
                null,
                null,
                null,
                desk.Floor,
                desk.Zone,
                null,
                desk.FloorNumber),

            Room room => new SpaceDto(
                room.Id,
                room.Name,
                room.Code,
                room.Type,
                room.IsActive,
                room.Description,
                null,
                room.MonthlySubscriptionRate.Amount,
                room.MonthlySubscriptionRate.Currency,
                room.AreaSquareMeters,
                room.Capacity,
                null,
                null,
                null,
                null,
                room.FloorNumber),

            ParkingSpace parking => new SpaceDto(
                parking.Id,
                parking.Name,
                parking.Code,
                parking.Type,
                parking.IsActive,
                parking.Description,
                parking.HourlyRate.Amount,
                null,
                parking.HourlyRate.Currency,
                null,
                null,
                parking.SpotNumber,
                null,
                null,
                parking.Level,
                parking.FloorNumber),

            _ => throw new InvalidOperationException($"Unsupported space type '{space.GetType().Name}'.")
        };
}
