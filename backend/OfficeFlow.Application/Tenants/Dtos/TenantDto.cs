namespace OfficeFlow.Application.Tenants.Dtos;

public sealed record TenantDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string? CompanyName,
    bool IsActive);
