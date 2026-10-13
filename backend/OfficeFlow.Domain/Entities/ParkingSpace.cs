using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Parking spot that can be reserved hourly alongside desks or other resources.
/// </summary>
public sealed class ParkingSpace : Space
{
    public string SpotNumber { get; private set; } = null!;
    public Money HourlyRate { get; private set; } = null!;
    public string? Level { get; private set; }

    public override SpaceType Type => SpaceType.ParkingSpace;

    private ParkingSpace()
    {
    }

    public ParkingSpace(
        string name,
        string code,
        string spotNumber,
        Money hourlyRate,
        string? level = null,
        string? description = null)
        : this(Guid.NewGuid(), name, code, spotNumber, hourlyRate, level, description)
    {
    }

    public ParkingSpace(
        Guid id,
        string name,
        string code,
        string spotNumber,
        Money hourlyRate,
        string? level = null,
        string? description = null)
        : base(id, name, code, description)
    {
        SetSpotNumber(spotNumber);
        SetHourlyRate(hourlyRate);
        Level = NormalizeOptional(level);
    }

    public void SetSpotNumber(string spotNumber)
    {
        if (string.IsNullOrWhiteSpace(spotNumber))
        {
            throw new DomainException("Parking spot number is required.");
        }

        SpotNumber = spotNumber.Trim().ToUpperInvariant();
    }

    public void SetHourlyRate(Money hourlyRate)
    {
        ArgumentNullException.ThrowIfNull(hourlyRate);

        if (hourlyRate.Amount <= 0)
        {
            throw new DomainException("Parking hourly rate must be greater than zero.");
        }

        HourlyRate = hourlyRate;
    }

    public void SetLevel(string? level) => Level = NormalizeOptional(level);

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

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
