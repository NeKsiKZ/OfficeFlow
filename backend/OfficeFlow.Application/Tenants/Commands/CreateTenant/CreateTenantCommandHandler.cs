using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Tenants.Commands.CreateTenant;

public sealed class CreateTenantCommandHandler
    : IRequestHandler<CreateTenantCommand, CreateTenantResult>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateTenantResult> Handle(
        CreateTenantCommand request,
        CancellationToken cancellationToken)
    {
        var tenant = new Tenant(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber,
            request.CompanyName);

        await _tenantRepository.AddAsync(tenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateTenantResult(
            tenant.Id,
            tenant.FirstName,
            tenant.LastName,
            tenant.Email);
    }
}
