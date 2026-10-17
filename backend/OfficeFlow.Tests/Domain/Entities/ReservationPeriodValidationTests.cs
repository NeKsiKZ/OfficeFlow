using FluentAssertions;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Tests.Domain.Entities;

public sealed class ReservationPeriodValidationTests
{
    private static readonly DateTime Clock =
        new(2026, 10, 17, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Desk_Accepts_OneToTwelveHourPeriod()
    {
        var tenant = CreateTenant();
        var desk = new Desk("Desk A", "DESK-A", new Money(25m));
        var start = Clock.AddHours(1);
        var period = new DateRange(start, start.AddHours(3));

        var act = () => new Reservation(tenant, desk, period, clockUtc: Clock);

        act.Should().NotThrow();
    }

    [Fact]
    public void Desk_Rejects_PeriodShorterThanOneHour()
    {
        var tenant = CreateTenant();
        var desk = new Desk("Desk A", "DESK-A", new Money(25m));
        var start = Clock.AddHours(1);
        var period = new DateRange(start, start.AddMinutes(30));

        var act = () => new Reservation(tenant, desk, period, clockUtc: Clock);

        act.Should().Throw<DomainException>()
            .WithMessage("*at least 1 hour*");
    }

    [Fact]
    public void Desk_Rejects_PeriodLongerThanTwelveHours()
    {
        var tenant = CreateTenant();
        var desk = new Desk("Desk A", "DESK-A", new Money(25m));
        var start = Clock.AddHours(1);
        var period = new DateRange(start, start.AddHours(13));

        var act = () => new Reservation(tenant, desk, period, clockUtc: Clock);

        act.Should().Throw<DomainException>()
            .WithMessage("*cannot exceed 12 hours*");
    }

    [Fact]
    public void Room_Accepts_ExactCalendarMonths_AndBillsMonthlyRate()
    {
        var tenant = CreateTenant();
        var room = new Room("Room 1", "ROOM-1", new Money(2000m), 20m, 4);
        var start = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc);
        var period = DateRange.ForCalendarMonths(start, 3);

        var reservation = new Reservation(tenant, room, period, clockUtc: Clock);

        reservation.TotalCost.Amount.Should().Be(6000m);
        reservation.Period.EndUtc.Should().Be(new DateTime(2027, 2, 1, 0, 0, 0, DateTimeKind.Utc));
    }

    [Fact]
    public void Room_Rejects_NonWholeMonthPeriod()
    {
        var tenant = CreateTenant();
        var room = new Room("Room 1", "ROOM-1", new Money(2000m), 20m, 4);
        var start = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc);
        var period = new DateRange(start, start.AddDays(45));

        var act = () => new Reservation(tenant, room, period, clockUtc: Clock);

        act.Should().Throw<DomainException>()
            .WithMessage("*whole calendar months*");
    }

    [Fact]
    public void Room_Rejects_PastStartDate()
    {
        var tenant = CreateTenant();
        var room = new Room("Room 1", "ROOM-1", new Money(2000m), 20m, 4);
        var start = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc);
        var period = DateRange.ForCalendarMonths(start, 1);

        var act = () => new Reservation(tenant, room, period, clockUtc: Clock);

        act.Should().Throw<DomainException>()
            .WithMessage("*cannot be in the past*");
    }

    [Fact]
    public void Parking_Rejects_ServiceNotApplicableToParking()
    {
        var tenant = CreateTenant();
        var parking = new ParkingSpace(
            "Parking P1",
            "PARK-1",
            "P-01",
            new Money(10m));
        var media = new AdditionalService(
            "Pakiet mediów",
            new Money(35m),
            [SpaceType.Desk, SpaceType.Room]);
        var start = Clock.AddHours(1);
        var period = new DateRange(start, start.AddHours(2));

        var act = () => new Reservation(
            tenant,
            parking,
            period,
            additionalServices: [media],
            clockUtc: Clock);

        act.Should().Throw<DomainException>()
            .WithMessage("*cannot be attached to a ParkingSpace*");
    }

    private static Tenant CreateTenant() =>
        new("Jan", "Kowalski", "jan.kowalski@officeflow.local");
}
