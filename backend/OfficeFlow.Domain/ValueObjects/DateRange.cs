using OfficeFlow.Domain.Exceptions;

namespace OfficeFlow.Domain.ValueObjects;

public sealed class DateRange : IEquatable<DateRange>
{
    public const int MaxCalendarMonths = 36;

    public DateTime StartUtc { get; private set; }
    public DateTime EndUtc { get; private set; }

    private DateRange()
    {
    }

    public DateRange(DateTime startUtc, DateTime endUtc)
    {
        if (startUtc.Kind == DateTimeKind.Unspecified)
        {
            startUtc = DateTime.SpecifyKind(startUtc, DateTimeKind.Utc);
        }

        if (endUtc.Kind == DateTimeKind.Unspecified)
        {
            endUtc = DateTime.SpecifyKind(endUtc, DateTimeKind.Utc);
        }

        startUtc = startUtc.ToUniversalTime();
        endUtc = endUtc.ToUniversalTime();

        if (endUtc <= startUtc)
        {
            throw new ArgumentException("End must be greater than start.", nameof(endUtc));
        }

        StartUtc = startUtc;
        EndUtc = endUtc;
    }

    /// <summary>
    /// Builds a period of exact calendar months from a UTC start instant.
    /// </summary>
    public static DateRange ForCalendarMonths(DateTime startUtc, int monthCount)
    {
        if (monthCount < 1 || monthCount > MaxCalendarMonths)
        {
            throw new DomainException(
                $"Month count must be between 1 and {MaxCalendarMonths}.");
        }

        if (startUtc.Kind == DateTimeKind.Unspecified)
        {
            startUtc = DateTime.SpecifyKind(startUtc, DateTimeKind.Utc);
        }

        startUtc = startUtc.ToUniversalTime();
        return new DateRange(startUtc, startUtc.AddMonths(monthCount));
    }

    /// <summary>
    /// Returns the number of whole calendar months when End equals Start.AddMonths(N).
    /// </summary>
    public int GetExactCalendarMonthCount()
    {
        for (var months = 1; months <= MaxCalendarMonths; months++)
        {
            if (StartUtc.AddMonths(months) == EndUtc)
            {
                return months;
            }
        }

        throw new DomainException(
            "Room reservations must cover whole calendar months (start + N months).");
    }

    public TimeSpan Duration => EndUtc - StartUtc;

    public decimal DurationInHours => (decimal)Duration.TotalHours;

    public decimal DurationInDays => (decimal)Duration.TotalDays;

    public bool Overlaps(DateRange other) =>
        StartUtc < other.EndUtc && EndUtc > other.StartUtc;

    public bool Equals(DateRange? other) =>
        other is not null && StartUtc == other.StartUtc && EndUtc == other.EndUtc;

    public override bool Equals(object? obj) => Equals(obj as DateRange);

    public override int GetHashCode() => HashCode.Combine(StartUtc, EndUtc);
}
