using OfficeFlow.Domain.Common;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Reservation / lease request created by a tenant for a specific space and period.
/// </summary>
public sealed class Reservation : Entity
{
    public Guid TenantId { get; private set; }
    public Guid SpaceId { get; private set; }
    public SpaceType SpaceType { get; private set; }
    public DateRange Period { get; private set; } = null!;
    public Money TotalCost { get; private set; } = null!;
    public ReservationStatus Status { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public string? Notes { get; private set; }

    private Reservation()
    {
    }

    public Reservation(
        Tenant tenant,
        Space space,
        DateRange period,
        string? notes = null)
        : this(Guid.NewGuid(), tenant, space, period, notes)
    {
    }

    public Reservation(
        Guid id,
        Tenant tenant,
        Space space,
        DateRange period,
        string? notes = null)
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

        TenantId = tenant.Id;
        SpaceId = space.Id;
        SpaceType = space.Type;
        Period = period;
        TotalCost = space.CalculateCost(period);
        Status = ReservationStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
        Notes = NormalizeOptional(notes);
    }

    public void Confirm()
    {
        EnsurePending();
        Status = ReservationStatus.Confirmed;
    }

    public void Reject()
    {
        EnsurePending();
        Status = ReservationStatus.Rejected;
    }

    public void Cancel()
    {
        if (Status is ReservationStatus.Cancelled or ReservationStatus.Rejected or ReservationStatus.Completed)
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

        TotalCost = space.CalculateCost(Period);
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
