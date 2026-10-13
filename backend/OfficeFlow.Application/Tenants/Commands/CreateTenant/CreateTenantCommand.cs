using MediatR;

namespace OfficeFlow.Application.Tenants.Commands.CreateTenant;

public sealed record CreateTenantCommand(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber = null,
    string? CompanyName = null) : IRequest<CreateTenantResult>;
