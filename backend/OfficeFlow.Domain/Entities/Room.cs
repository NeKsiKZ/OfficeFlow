using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Office room / cabinet rented on a monthly subscription basis.
/// </summary>
public sealed class Room : Space
{
    public const int MinSubscriptionMonths = 1;
    public const int MaxSubscriptionMonths = 24;

    public Money MonthlySubscriptionRate { get; private set; } = null!;
    public decimal AreaSquareMeters { get; private set; }
    public int Capacity { get; private set; }

    public override SpaceType Type => SpaceType.Room;

    private Room()
    {
    }

    public Room(
        string name,
        string code,
        Money monthlySubscriptionRate,
        decimal areaSquareMeters,
        int capacity,
        string? description = null,
        int floorNumber = 1)
        : this(
            Guid.NewGuid(),
            name,
            code,
            monthlySubscriptionRate,
            areaSquareMeters,
            capacity,
            description,
            floorNumber)
    {
    }

    public Room(
        Guid id,
        string name,
        string code,
        Money monthlySubscriptionRate,
        decimal areaSquareMeters,
        int capacity,
        string? description = null,
        int floorNumber = 1)
        : base(id, name, code, description, floorNumber)
    {
        SetMonthlySubscriptionRate(monthlySubscriptionRate);
        SetArea(areaSquareMeters);
        SetCapacity(capacity);
    }

    public void SetMonthlySubscriptionRate(Money monthlySubscriptionRate)
    {
        ArgumentNullException.ThrowIfNull(monthlySubscriptionRate);

        if (monthlySubscriptionRate.Amount <= 0)
        {
            throw new DomainException("Room monthly subscription rate must be greater than zero.");
        }

        MonthlySubscriptionRate = monthlySubscriptionRate;
    }

    public void SetArea(decimal areaSquareMeters)
    {
        if (areaSquareMeters <= 0)
        {
            throw new DomainException("Room area must be greater than zero.");
        }

        AreaSquareMeters = decimal.Round(areaSquareMeters, 2, MidpointRounding.AwayFromZero);
    }

    public void SetCapacity(int capacity)
    {
        if (capacity <= 0)
        {
            throw new DomainException("Room capacity must be greater than zero.");
        }

        Capacity = capacity;
    }

    public override Money CalculateCost(DateRange period)
    {
        ArgumentNullException.ThrowIfNull(period);

        // Subscription billing: exact calendar months only (start + N months = end).
        var months = period.GetExactCalendarMonthCount();
        return MonthlySubscriptionRate.Multiply(months);
    }

    public override void EnsureValidReservationPeriod(DateRange period, DateTime utcNow)
    {
        ArgumentNullException.ThrowIfNull(period);

        if (utcNow.Kind == DateTimeKind.Unspecified)
        {
            utcNow = DateTime.SpecifyKind(utcNow, DateTimeKind.Utc);
        }

        utcNow = utcNow.ToUniversalTime();

        // Compare by UTC calendar date so a same-day start at midnight is allowed.
        if (period.StartUtc.Date < utcNow.Date)
        {
            throw new DomainException("Room subscription start date cannot be in the past.");
        }

        var months = period.GetExactCalendarMonthCount();
        if (months < MinSubscriptionMonths || months > MaxSubscriptionMonths)
        {
            throw new DomainException(
                $"Room subscriptions must be between {MinSubscriptionMonths} and {MaxSubscriptionMonths} months.");
        }
    }
}
