using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Desk rented on an hourly basis (hot-desking / short-term booking).
/// </summary>
public sealed class Desk : Space
{
    public const int MinReservationHours = 1;
    public const int MaxReservationHours = 12;

    public Money HourlyRate { get; private set; } = null!;
    public string? Floor { get; private set; }
    public string? Zone { get; private set; }

    public override SpaceType Type => SpaceType.Desk;

    private Desk()
    {
    }

    public Desk(
        string name,
        string code,
        Money hourlyRate,
        string? floor = null,
        string? zone = null,
        string? description = null,
        int floorNumber = 1)
        : this(Guid.NewGuid(), name, code, hourlyRate, floor, zone, description, floorNumber)
    {
    }

    public Desk(
        Guid id,
        string name,
        string code,
        Money hourlyRate,
        string? floor = null,
        string? zone = null,
        string? description = null,
        int floorNumber = 1)
        : base(id, name, code, description, floorNumber)
    {
        SetHourlyRate(hourlyRate);
        Floor = NormalizeOptional(floor) ?? floorNumber.ToString();
        Zone = NormalizeOptional(zone);
    }

    public void SetHourlyRate(Money hourlyRate)
    {
        ArgumentNullException.ThrowIfNull(hourlyRate);

        if (hourlyRate.Amount <= 0)
        {
            throw new DomainException("Desk hourly rate must be greater than zero.");
        }

        HourlyRate = hourlyRate;
    }

    public void Relocate(string? floor, string? zone)
    {
        Floor = NormalizeOptional(floor);
        Zone = NormalizeOptional(zone);
    }

    public override Money CalculateCost(DateRange period)
    {
        ArgumentNullException.ThrowIfNull(period);

        var billableHours = Math.Ceiling(period.DurationInHours * 4m) / 4m;
        if (billableHours <= 0)
        {
            throw new DomainException("Reservation period must result in a positive billable duration.");
        }

        return HourlyRate.Multiply(billableHours);
    }

    public override void EnsureValidReservationPeriod(DateRange period, DateTime utcNow)
    {
        ArgumentNullException.ThrowIfNull(period);
        HourlyReservationPeriodRules.EnsureValid(
            period,
            utcNow,
            MinReservationHours,
            MaxReservationHours,
            "Desk");
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
