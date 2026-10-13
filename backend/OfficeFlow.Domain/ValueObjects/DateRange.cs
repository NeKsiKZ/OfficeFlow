namespace OfficeFlow.Domain.ValueObjects;

public sealed class DateRange : IEquatable<DateRange>
{
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
