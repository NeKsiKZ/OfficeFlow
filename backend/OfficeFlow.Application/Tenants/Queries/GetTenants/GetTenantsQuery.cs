using MediatR;
using OfficeFlow.Application.Tenants.Dtos;

namespace OfficeFlow.Application.Tenants.Queries.GetTenants;

public sealed record GetTenantsQuery : IRequest<IReadOnlyList<TenantDto>>;
