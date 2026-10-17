using FluentAssertions;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Tests.Domain.Entities;

public sealed class ReservationLifecycleTests
{
    [Fact]
    public void TryCompleteIfDue_WhenConfirmedAndPastEnd_CompletesReservation()
    {
        var reservation = CreateConfirmedReservation(
            start: new DateTime(2026, 10, 1, 9, 0, 0, DateTimeKind.Utc),
            end: new DateTime(2026, 10, 1, 11, 0, 0, DateTimeKind.Utc));

        var completed = reservation.TryCompleteIfDue(
            new DateTime(2026, 10, 1, 12, 0, 0, DateTimeKind.Utc));

        completed.Should().BeTrue();
        reservation.Status.Should().Be(ReservationStatus.Completed);
    }

    [Fact]
    public void TryCompleteIfDue_WhenConfirmedAndBeforeEnd_DoesNotComplete()
    {
        var reservation = CreateConfirmedReservation(
            start: new DateTime(2026, 10, 1, 9, 0, 0, DateTimeKind.Utc),
            end: new DateTime(2026, 10, 1, 11, 0, 0, DateTimeKind.Utc));

        var completed = reservation.TryCompleteIfDue(
            new DateTime(2026, 10, 1, 10, 0, 0, DateTimeKind.Utc));

        completed.Should().BeFalse();
        reservation.Status.Should().Be(ReservationStatus.Confirmed);
    }

    [Fact]
    public void TryCompleteIfDue_WhenPending_DoesNotComplete()
    {
        var reservation = CreatePendingReservation(
            start: new DateTime(2026, 10, 1, 9, 0, 0, DateTimeKind.Utc),
            end: new DateTime(2026, 10, 1, 11, 0, 0, DateTimeKind.Utc));

        var completed = reservation.TryCompleteIfDue(
            new DateTime(2026, 10, 1, 12, 0, 0, DateTimeKind.Utc));

        completed.Should().BeFalse();
        reservation.Status.Should().Be(ReservationStatus.Pending);
    }

    private static Reservation CreatePendingReservation(DateTime start, DateTime end)
    {
        var tenant = new Tenant("Anna", "Nowak", "anna.nowak@officeflow.local");
        var desk = new Desk("Biurko B1", "DESK-B1", new Money(28m));
        // Clock before start so historical fixtures remain valid for lifecycle tests.
        return new Reservation(tenant, desk, new DateRange(start, end), clockUtc: start.AddHours(-1));
    }

    private static Reservation CreateConfirmedReservation(DateTime start, DateTime end)
    {
        var reservation = CreatePendingReservation(start, end);
        reservation.Confirm();
        return reservation;
    }
}
