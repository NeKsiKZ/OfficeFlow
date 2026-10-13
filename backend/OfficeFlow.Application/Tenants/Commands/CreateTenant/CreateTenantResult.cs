namespace OfficeFlow.Application.Tenants.Commands.CreateTenant;

public sealed record CreateTenantResult(
    Guid TenantId,
    string FirstName,
    string LastName,
    string Email);
