using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Spaces.Dtos;

public sealed record SpaceDto(
    Guid Id,
    string Name,
    string Code,
    SpaceType Type,
    bool IsActive,
    string? Description,
    decimal? HourlyRate,
    decimal? MonthlySubscriptionRate,
    string? Currency,
    decimal? AreaSquareMeters,
    int? Capacity,
    string? SpotNumber,
    string? Floor,
    string? Zone,
    string? Level);
