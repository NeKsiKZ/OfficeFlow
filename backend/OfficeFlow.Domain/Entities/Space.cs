using OfficeFlow.Domain.Common;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Base aggregate root for rentable office resources (desks, rooms, parking spaces).
/// </summary>
public abstract class Space : Entity
{
    public const int MinFloorNumber = -10;
    public const int MaxFloorNumber = 50;

    public string Name { get; private set; } = null!;
    public string Code { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }

    /// <summary>
    /// Campus floor index used by the map (-2 basement … 0 ground … 2 upper).
    /// Layout customization per floor is planned for managers later.
    /// </summary>
    public int FloorNumber { get; private set; }

    public abstract SpaceType Type { get; }

    protected Space()
    {
    }

    protected Space(
        Guid id,
        string name,
        string code,
        string? description = null,
        int floorNumber = 0)
        : base(id)
    {
        Rename(name);
        SetCode(code);
        Description = NormalizeOptional(description);
        SetFloorNumber(floorNumber);
        IsActive = true;
    }

    public void Rename(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Space name is required.");
        }

        Name = name.Trim();
    }

    public void SetCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new DomainException("Space code is required.");
        }

        Code = code.Trim().ToUpperInvariant();
    }

    public void UpdateDescription(string? description) =>
        Description = NormalizeOptional(description);

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public void SetFloorNumber(int floorNumber)
    {
        if (floorNumber < MinFloorNumber || floorNumber > MaxFloorNumber)
        {
            throw new DomainException(
                $"Floor number must be between {MinFloorNumber} and {MaxFloorNumber}.");
        }

        FloorNumber = floorNumber;
    }

    public abstract Money CalculateCost(DateRange period);

    /// <summary>
    /// Validates that <paramref name="period"/> fits this space's billing model.
    /// </summary>
    public abstract void EnsureValidReservationPeriod(DateRange period, DateTime utcNow);

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
