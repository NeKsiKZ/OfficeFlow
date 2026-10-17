using OfficeFlow.Domain.Common;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Optional add-on service that can be attached to a reservation
/// (parking, media, storage locker, etc.) for selected space types only.
/// </summary>
public sealed class AdditionalService : Entity
{
    private readonly List<Reservation> _reservations = [];

    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public Money Price { get; private set; } = null!;

    /// <summary>
    /// Space types that may include this add-on. Mutate only via <see cref="SetApplicableSpaceTypes"/>.
    /// </summary>
    public List<SpaceType> ApplicableSpaceTypes { get; private set; } = [];

    public IReadOnlyCollection<Reservation> Reservations => _reservations.AsReadOnly();

    private AdditionalService()
    {
    }

    public AdditionalService(
        string name,
        Money price,
        IEnumerable<SpaceType> applicableSpaceTypes,
        string? description = null)
        : this(Guid.NewGuid(), name, price, applicableSpaceTypes, description)
    {
    }

    public AdditionalService(
        Guid id,
        string name,
        Money price,
        IEnumerable<SpaceType> applicableSpaceTypes,
        string? description = null)
        : base(id)
    {
        ArgumentNullException.ThrowIfNull(price);
        SetName(name);
        Price = price;
        Description = NormalizeOptional(description);
        SetApplicableSpaceTypes(applicableSpaceTypes);
    }

    public void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Service name is required.");
        }

        Name = name.Trim();
    }

    public void SetDescription(string? description) =>
        Description = NormalizeOptional(description);

    public void SetPrice(Money price)
    {
        ArgumentNullException.ThrowIfNull(price);
        Price = price;
    }

    public void SetApplicableSpaceTypes(IEnumerable<SpaceType> applicableSpaceTypes)
    {
        ArgumentNullException.ThrowIfNull(applicableSpaceTypes);

        var distinct = applicableSpaceTypes
            .Distinct()
            .OrderBy(type => type)
            .ToList();

        if (distinct.Count == 0)
        {
            throw new DomainException(
                "At least one applicable space type is required for an additional service.");
        }

        foreach (var spaceType in distinct)
        {
            if (!Enum.IsDefined(typeof(SpaceType), spaceType))
            {
                throw new DomainException($"Unknown space type '{spaceType}'.");
            }
        }

        ApplicableSpaceTypes = distinct;
    }

    public bool AppliesTo(SpaceType spaceType) =>
        ApplicableSpaceTypes.Contains(spaceType);

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
