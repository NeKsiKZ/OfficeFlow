using OfficeFlow.Domain.Common;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Reservation / lease request created by a tenant for a specific space and period.
/// Lifecycle: Pending → Confirmed → Completed (auto) | Cancelled.
/// </summary>
public sealed class Reservation : Entity
{
    private readonly List<AdditionalService> _additionalServices = [];

    public Guid TenantId { get; private set; }
    public Guid SpaceId { get; private set; }
    public SpaceType SpaceType { get; private set; }
    public DateRange Period { get; private set; } = null!;
    public Money TotalCost { get; private set; } = null!;
    public ReservationStatus Status { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public string? Notes { get; private set; }

    public IReadOnlyCollection<AdditionalService> AdditionalServices =>
        _additionalServices.AsReadOnly();

    private Reservation()
    {
    }

    public Reservation(
        Tenant tenant,
        Space space,
        DateRange period,
        IEnumerable<AdditionalService>? additionalServices = null,
        string? notes = null,
        DateTime? clockUtc = null)
        : this(Guid.NewGuid(), tenant, space, period, additionalServices, notes, clockUtc)
    {
    }

    public Reservation(
        Guid id,
        Tenant tenant,
        Space space,
        DateRange period,
        IEnumerable<AdditionalService>? additionalServices = null,
        string? notes = null,
        DateTime? clockUtc = null)
        : base(id)
    {
        ArgumentNullException.ThrowIfNull(tenant);
        ArgumentNullException.ThrowIfNull(space);
        ArgumentNullException.ThrowIfNull(period);

        if (!tenant.IsActive)
        {
            throw new DomainException("Inactive tenant cannot create a reservation.");
        }

        if (!space.IsActive)
        {
            throw new DomainException("Inactive space cannot be reserved.");
        }

        var now = clockUtc ?? DateTime.UtcNow;
        space.EnsureValidReservationPeriod(period, now);

        TenantId = tenant.Id;
        SpaceId = space.Id;
        SpaceType = space.Type;
        Period = period;
        Status = ReservationStatus.Pending;
        CreatedAtUtc = now.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(now, DateTimeKind.Utc)
            : now.ToUniversalTime();
        Notes = NormalizeOptional(notes);

        AssignAdditionalServices(additionalServices);
        EnsureServicesApplyToSpace(space.Type);
        TotalCost = CalculateTotalCost(space, period, _additionalServices);
    }

    private void EnsureServicesApplyToSpace(SpaceType spaceType)
    {
        foreach (var service in _additionalServices)
        {
            if (!service.AppliesTo(spaceType))
            {
                throw new DomainException(
                    $"Service '{service.Name}' cannot be attached to a {spaceType} reservation.");
            }
        }
    }

    public void Confirm()
    {
        EnsurePending();
        Status = ReservationStatus.Confirmed;
    }

    public void Cancel()
    {
        if (Status is not (ReservationStatus.Pending or ReservationStatus.Confirmed))
        {
            throw new DomainException($"Reservation in status '{Status}' cannot be cancelled.");
        }

        Status = ReservationStatus.Cancelled;
    }

    public void Complete()
    {
        if (Status != ReservationStatus.Confirmed)
        {
            throw new DomainException("Only confirmed reservations can be completed.");
        }

        Status = ReservationStatus.Completed;
    }

    /// <summary>
    /// Completes a confirmed reservation when its period has ended.
    /// </summary>
    /// <returns>True when the status changed to Completed.</returns>
    public bool TryCompleteIfDue(DateTime utcNow)
    {
        if (Status != ReservationStatus.Confirmed)
        {
            return false;
        }

        var now = utcNow.Kind switch
        {
            DateTimeKind.Unspecified => DateTime.SpecifyKind(utcNow, DateTimeKind.Utc),
            DateTimeKind.Local => utcNow.ToUniversalTime(),
            _ => utcNow
        };

        if (Period.EndUtc > now)
        {
            return false;
        }

        Complete();
        return true;
    }

    public void RecalculateCost(Space space)
    {
        ArgumentNullException.ThrowIfNull(space);

        if (space.Id != SpaceId)
        {
            throw new DomainException("Space does not match this reservation.");
        }

        if (Status is not (ReservationStatus.Pending or ReservationStatus.Confirmed))
        {
            throw new DomainException($"Cost cannot be recalculated for reservation in status '{Status}'.");
        }

        TotalCost = CalculateTotalCost(space, Period, _additionalServices);
    }

    public static Money CalculateTotalCost(
        Space space,
        DateRange period,
        IEnumerable<AdditionalService> additionalServices)
    {
        ArgumentNullException.ThrowIfNull(space);
        ArgumentNullException.ThrowIfNull(period);
        ArgumentNullException.ThrowIfNull(additionalServices);

        var total = space.CalculateCost(period);

        // Room add-ons are monthly rates; hourly bookings charge the listed price once.
        var serviceMultiplier = space.Type == SpaceType.Room
            ? period.GetExactCalendarMonthCount()
            : 1;

        foreach (var service in additionalServices)
        {
            total = total.Add(service.Price.Multiply(serviceMultiplier));
        }

        return total;
    }

    private void AssignAdditionalServices(IEnumerable<AdditionalService>? additionalServices)
    {
        _additionalServices.Clear();

        if (additionalServices is null)
        {
            return;
        }

        foreach (var service in additionalServices.DistinctBy(service => service.Id))
        {
            ArgumentNullException.ThrowIfNull(service);
            _additionalServices.Add(service);
        }
    }

    private void EnsurePending()
    {
        if (Status != ReservationStatus.Pending)
        {
            throw new DomainException($"Operation is allowed only for pending reservations. Current status: '{Status}'.");
        }
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
