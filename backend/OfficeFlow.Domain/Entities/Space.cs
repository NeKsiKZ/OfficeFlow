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
    public string Name { get; private set; } = null!;
    public string Code { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public abstract SpaceType Type { get; }

    protected Space()
    {
    }

    protected Space(Guid id, string name, string code, string? description = null)
        : base(id)
    {
        Rename(name);
        SetCode(code);
        Description = NormalizeOptional(description);
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

    public abstract Money CalculateCost(DateRange period);

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
