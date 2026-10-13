using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Office room / cabinet rented on a monthly subscription basis.
/// </summary>
public sealed class Room : Space
{
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
        string? description = null)
        : this(Guid.NewGuid(), name, code, monthlySubscriptionRate, areaSquareMeters, capacity, description)
    {
    }

    public Room(
        Guid id,
        string name,
        string code,
        Money monthlySubscriptionRate,
        decimal areaSquareMeters,
        int capacity,
        string? description = null)
        : base(id, name, code, description)
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

        // Subscription billing: charge full months, rounding partial months up.
        var months = (int)Math.Ceiling((double)period.DurationInDays / 30d);
        if (months <= 0)
        {
            months = 1;
        }

        return MonthlySubscriptionRate.Multiply(months);
    }
}
