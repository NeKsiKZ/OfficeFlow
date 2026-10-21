using OfficeFlow.Application.Reports.Dtos;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Reports;

/// <summary>
/// Pure aggregation for manager profit / booking statistics.
/// Period-scoped: revenue and monthly series.
/// Live-scoped: awaiting confirmation (Pending) and current occupancy.
/// </summary>
public static class ManagerStatsCalculator
{
    private static readonly ReservationStatus[] RecognizedStatuses =
    [
        ReservationStatus.Confirmed,
        ReservationStatus.Completed
    ];

    public static ManagerStatsDto Calculate(
        IReadOnlyList<Reservation> periodReservations,
        IReadOnlyList<Reservation> liveReservations,
        IReadOnlyList<Space> spaces,
        DateTime generatedAtUtc,
        DateTime? fromUtc,
        DateTime? toUtc)
    {
        var currency = periodReservations
            .Concat(liveReservations)
            .Select(r => r.TotalCost.Currency)
            .FirstOrDefault(c => !string.IsNullOrWhiteSpace(c))
            ?? "PLN";

        var periodPending = periodReservations.Where(r => r.Status == ReservationStatus.Pending).ToList();
        var periodConfirmed = periodReservations.Where(r => r.Status == ReservationStatus.Confirmed).ToList();
        var periodCompleted = periodReservations.Where(r => r.Status == ReservationStatus.Completed).ToList();
        var periodCancelled = periodReservations.Where(r => r.Status == ReservationStatus.Cancelled).ToList();
        var recognized = periodReservations.Where(r => RecognizedStatuses.Contains(r.Status)).ToList();

        var livePendingCount = liveReservations.Count(r => r.Status == ReservationStatus.Pending);

        var recognizedAmount = Sum(recognized);
        var realizedAmount = Sum(periodCompleted);
        var pipelineAmount = Sum(periodPending);
        var cancelledAmount = Sum(periodCancelled);
        var averageBooking = recognized.Count == 0
            ? 0m
            : Math.Round(recognizedAmount / recognized.Count, 2, MidpointRounding.AwayFromZero);

        var activeSpaces = spaces.Count(space => space.IsActive);
        var occupiedSpaceIds = liveReservations
            .Where(r =>
                r.Status == ReservationStatus.Confirmed &&
                r.Period.StartUtc <= generatedAtUtc &&
                r.Period.EndUtc > generatedAtUtc)
            .Select(r => r.SpaceId)
            .Distinct()
            .Count();

        var occupancyPercent = activeSpaces == 0
            ? 0m
            : Math.Round(
                occupiedSpaceIds * 100m / activeSpaces,
                1,
                MidpointRounding.AwayFromZero);

        var byStatus = new[]
        {
            new StatusBreakdownDto(nameof(ReservationStatus.Pending), periodPending.Count, Sum(periodPending)),
            new StatusBreakdownDto(nameof(ReservationStatus.Confirmed), periodConfirmed.Count, Sum(periodConfirmed)),
            new StatusBreakdownDto(nameof(ReservationStatus.Completed), periodCompleted.Count, Sum(periodCompleted)),
            new StatusBreakdownDto(nameof(ReservationStatus.Cancelled), periodCancelled.Count, Sum(periodCancelled)),
        };

        var bySpaceType = Enum.GetValues<SpaceType>()
            .Select(type =>
            {
                var forType = recognized.Where(r => r.SpaceType == type).ToList();
                return new SpaceTypeBreakdownDto(
                    type.ToString(),
                    forType.Count,
                    Sum(forType));
            })
            .Where(row => row.ReservationCount > 0)
            .OrderByDescending(row => row.RecognizedAmount)
            .ToList();

        var monthly = BuildMonthlySeries(recognized, fromUtc, toUtc, generatedAtUtc);

        return new ManagerStatsDto(
            GeneratedAtUtc: generatedAtUtc,
            FromUtc: fromUtc,
            ToUtc: toUtc,
            Currency: currency,
            Revenue: new RevenueStatsDto(
                RecognizedAmount: recognizedAmount,
                RealizedAmount: realizedAmount,
                PipelineAmount: pipelineAmount,
                CancelledAmount: cancelledAmount,
                AverageBookingAmount: averageBooking),
            Counts: new ReservationCountStatsDto(
                Total: periodReservations.Count,
                Pending: livePendingCount,
                Confirmed: periodConfirmed.Count,
                Completed: periodCompleted.Count,
                Cancelled: periodCancelled.Count),
            Occupancy: new OccupancyStatsDto(
                ActiveSpaces: activeSpaces,
                CurrentlyOccupiedSpaces: occupiedSpaceIds,
                OccupancyPercent: occupancyPercent),
            ByStatus: byStatus,
            BySpaceType: bySpaceType,
            MonthlyRevenue: monthly);
    }

    private static decimal Sum(IEnumerable<Reservation> items) =>
        items.Sum(r => r.TotalCost.Amount);

    private static IReadOnlyList<MonthlyRevenueDto> BuildMonthlySeries(
        IReadOnlyList<Reservation> recognized,
        DateTime? fromUtc,
        DateTime? toUtc,
        DateTime generatedAtUtc)
    {
        var endMonth = new DateTime(
            (toUtc ?? generatedAtUtc).Year,
            (toUtc ?? generatedAtUtc).Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);

        var startMonth = fromUtc.HasValue
            ? new DateTime(fromUtc.Value.Year, fromUtc.Value.Month, 1, 0, 0, 0, DateTimeKind.Utc)
            : endMonth.AddMonths(-5);

        if (startMonth > endMonth)
        {
            (startMonth, endMonth) = (endMonth, startMonth);
        }

        var buckets = new List<MonthlyRevenueDto>();
        for (var cursor = startMonth; cursor <= endMonth; cursor = cursor.AddMonths(1))
        {
            var monthItems = recognized
                .Where(r =>
                    r.Period.StartUtc.Year == cursor.Year &&
                    r.Period.StartUtc.Month == cursor.Month)
                .ToList();

            buckets.Add(new MonthlyRevenueDto(
                Year: cursor.Year,
                Month: cursor.Month,
                Label: cursor.ToString("yyyy-MM"),
                RecognizedAmount: Sum(monthItems),
                ReservationCount: monthItems.Count));
        }

        return buckets;
    }
}
