using OfficeFlow.Domain.Common;
using OfficeFlow.Domain.Exceptions;

namespace OfficeFlow.Domain.Entities;

/// <summary>
/// Tenant (najemca) who searches offers and creates reservations.
/// </summary>
public sealed class Tenant : Entity
{
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string? PhoneNumber { get; private set; }
    public string? CompanyName { get; private set; }
    public bool IsActive { get; private set; }

    private Tenant()
    {
    }

    public Tenant(
        string firstName,
        string lastName,
        string email,
        string? phoneNumber = null,
        string? companyName = null)
        : this(Guid.NewGuid(), firstName, lastName, email, phoneNumber, companyName)
    {
    }

    public Tenant(
        Guid id,
        string firstName,
        string lastName,
        string email,
        string? phoneNumber = null,
        string? companyName = null)
        : base(id)
    {
        UpdateProfile(firstName, lastName, phoneNumber, companyName);
        ChangeEmail(email);
        IsActive = true;
    }

    public string FullName => $"{FirstName} {LastName}";

    public void UpdateProfile(
        string firstName,
        string lastName,
        string? phoneNumber = null,
        string? companyName = null)
    {
        if (string.IsNullOrWhiteSpace(firstName))
        {
            throw new DomainException("Tenant first name is required.");
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            throw new DomainException("Tenant last name is required.");
        }

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        PhoneNumber = NormalizeOptional(phoneNumber);
        CompanyName = NormalizeOptional(companyName);
    }

    public void ChangeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new DomainException("Tenant email is required.");
        }

        var normalized = email.Trim();
        if (!normalized.Contains('@', StringComparison.Ordinal))
        {
            throw new DomainException("Tenant email format is invalid.");
        }

        Email = normalized.ToLowerInvariant();
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
