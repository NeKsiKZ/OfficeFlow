using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Tenants.Dtos;

namespace OfficeFlow.Application.Tenants.Queries.GetTenants;

public sealed class GetTenantsQueryHandler
    : IRequestHandler<GetTenantsQuery, IReadOnlyList<TenantDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<IReadOnlyList<TenantDto>> Handle(
        GetTenantsQuery request,
        CancellationToken cancellationToken)
    {
        var tenants = await _tenantRepository.GetAllAsync(cancellationToken);

        return tenants
            .Select(tenant => new TenantDto(
                tenant.Id,
                tenant.FirstName,
                tenant.LastName,
                tenant.Email,
                tenant.PhoneNumber,
                tenant.CompanyName,
                tenant.IsActive))
            .ToList();
    }
}
