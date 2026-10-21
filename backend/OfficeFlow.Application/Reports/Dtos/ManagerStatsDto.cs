namespace OfficeFlow.Application.Reports.Dtos;

public sealed record ManagerStatsDto(
    DateTime GeneratedAtUtc,
    DateTime? FromUtc,
    DateTime? ToUtc,
    string Currency,
    RevenueStatsDto Revenue,
    ReservationCountStatsDto Counts,
    OccupancyStatsDto Occupancy,
    IReadOnlyList<StatusBreakdownDto> ByStatus,
    IReadOnlyList<SpaceTypeBreakdownDto> BySpaceType,
    IReadOnlyList<MonthlyRevenueDto> MonthlyRevenue);

public sealed record RevenueStatsDto(
    decimal RecognizedAmount,
    decimal RealizedAmount,
    decimal PipelineAmount,
    decimal CancelledAmount,
    decimal AverageBookingAmount);

public sealed record ReservationCountStatsDto(
    int Total,
    int Pending,
    int Confirmed,
    int Completed,
    int Cancelled);

public sealed record OccupancyStatsDto(
    int ActiveSpaces,
    int CurrentlyOccupiedSpaces,
    decimal OccupancyPercent);

public sealed record StatusBreakdownDto(
    string Status,
    int Count,
    decimal TotalAmount);

public sealed record SpaceTypeBreakdownDto(
    string SpaceType,
    int ReservationCount,
    decimal RecognizedAmount);

public sealed record MonthlyRevenueDto(
    int Year,
    int Month,
    string Label,
    decimal RecognizedAmount,
    int ReservationCount);
