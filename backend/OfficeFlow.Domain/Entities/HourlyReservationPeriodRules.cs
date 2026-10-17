using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Shared period rules for hourly-billed spaces (desks, parking).
/// </summary>
internal static class HourlyReservationPeriodRules
{
    private static readonly TimeSpan ClockSkewGrace = TimeSpan.FromMinutes(2);

    public static void EnsureValid(
        DateRange period,
        DateTime utcNow,
        int minHours,
        int maxHours,
        string spaceLabel)
    {
        if (utcNow.Kind == DateTimeKind.Unspecified)
        {
            utcNow = DateTime.SpecifyKind(utcNow, DateTimeKind.Utc);
        }

        utcNow = utcNow.ToUniversalTime();

        if (period.StartUtc < utcNow - ClockSkewGrace)
        {
            throw new DomainException($"{spaceLabel} reservation start cannot be in the past.");
        }

        if (period.Duration < TimeSpan.FromHours(minHours))
        {
            throw new DomainException(
                $"{spaceLabel} reservations must last at least {minHours} hour(s).");
        }

        if (period.Duration > TimeSpan.FromHours(maxHours))
        {
            throw new DomainException(
                $"{spaceLabel} reservations cannot exceed {maxHours} hours.");
        }
    }
}
