using FluentAssertions;
using OfficeFlow.Application.Reports;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Tests.Application.Reports;

public sealed class ManagerStatsCalculatorTests
{
    [Fact]
    public void Calculate_SplitsRevenueByLifecycleAndOccupancy()
    {
        var now = new DateTime(2026, 10, 17, 12, 0, 0, DateTimeKind.Utc);

        var deskA = new Desk("Desk A", "D-A", new Money(50m));
        var deskB = new Desk("Desk B", "D-B", new Money(40m));
        var room = new Room("Room 1", "R-1", new Money(3000m), areaSquareMeters: 20m, capacity: 4);

        var tenant = new Tenant("Jan", "Kowalski", "jan@officeflow.local");

        var pending = new Reservation(
            tenant,
            deskA,
            new DateRange(now.AddDays(2), now.AddDays(2).AddHours(2)),
            clockUtc: now);

        var confirmedActive = new Reservation(
            tenant,
            deskB,
            new DateRange(now.AddHours(-1), now.AddHours(3)),
            clockUtc: now.AddHours(-2));
        confirmedActive.Confirm();

        var completed = new Reservation(
            tenant,
            deskA,
            new DateRange(now.AddDays(-3), now.AddDays(-3).AddHours(2)),
            clockUtc: now.AddDays(-4));
        completed.Confirm();
        completed.TryCompleteIfDue(now).Should().BeTrue();

        var cancelled = new Reservation(
            tenant,
            room,
            DateRange.ForCalendarMonths(
                new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc),
                1),
            clockUtc: now);
        cancelled.Cancel();

        var all = new[] { pending, confirmedActive, completed, cancelled };
        var stats = ManagerStatsCalculator.Calculate(
            all,
            all,
            [deskA, deskB, room],
            now,
            fromUtc: null,
            toUtc: null);

        stats.Currency.Should().Be("PLN");
        stats.Revenue.PipelineAmount.Should().Be(100m);
        stats.Revenue.RealizedAmount.Should().Be(100m);
        stats.Revenue.RecognizedAmount.Should().Be(260m);
        stats.Revenue.CancelledAmount.Should().Be(3000m);
        stats.Revenue.AverageBookingAmount.Should().Be(130m);

        stats.Counts.Total.Should().Be(4);
        stats.Counts.Pending.Should().Be(1);
        stats.Counts.Confirmed.Should().Be(1);
        stats.Counts.Completed.Should().Be(1);
        stats.Counts.Cancelled.Should().Be(1);

        stats.Occupancy.ActiveSpaces.Should().Be(3);
        stats.Occupancy.CurrentlyOccupiedSpaces.Should().Be(1);
        stats.Occupancy.OccupancyPercent.Should().Be(33.3m);

        stats.BySpaceType.Should().ContainSingle(row =>
            row.SpaceType == nameof(SpaceType.Desk) &&
            row.ReservationCount == 2 &&
            row.RecognizedAmount == 260m);

        stats.MonthlyRevenue.Should().NotBeEmpty();
    }

    [Fact]
    public void Calculate_PendingCountUsesLiveQueue_EvenWhenOutsideRevenuePeriod()
    {
        var now = new DateTime(2026, 10, 17, 12, 0, 0, DateTimeKind.Utc);
        var periodStart = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc);
        var periodEnd = new DateTime(2026, 10, 31, 23, 59, 59, DateTimeKind.Utc);

        var desk = new Desk("Desk A", "D-A", new Money(50m));
        var tenant = new Tenant("Jan", "Kowalski", "jan@officeflow.local");

        var pendingNextMonth = new Reservation(
            tenant,
            desk,
            new DateRange(
                new DateTime(2026, 11, 5, 9, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 11, 5, 11, 0, 0, DateTimeKind.Utc)),
            clockUtc: now);

        var completedInOctober = new Reservation(
            tenant,
            desk,
            new DateRange(
                new DateTime(2026, 10, 5, 9, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 10, 5, 11, 0, 0, DateTimeKind.Utc)),
            clockUtc: new DateTime(2026, 10, 4, 0, 0, 0, DateTimeKind.Utc));
        completedInOctober.Confirm();
        completedInOctober.TryCompleteIfDue(now).Should().BeTrue();

        var stats = ManagerStatsCalculator.Calculate(
            periodReservations: [completedInOctober],
            liveReservations: [pendingNextMonth, completedInOctober],
            spaces: [desk],
            generatedAtUtc: now,
            fromUtc: periodStart,
            toUtc: periodEnd);

        stats.Counts.Pending.Should().Be(1);
        stats.Revenue.RecognizedAmount.Should().Be(100m);
        stats.Revenue.PipelineAmount.Should().Be(0m);
    }
}
