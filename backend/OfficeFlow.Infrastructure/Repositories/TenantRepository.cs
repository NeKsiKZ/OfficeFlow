using Microsoft.EntityFrameworkCore;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Infrastructure.Persistence;

namespace OfficeFlow.Infrastructure.Repositories;

public sealed class TenantRepository : ITenantRepository
{
    private readonly ApplicationDbContext _dbContext;

    public TenantRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(tenant => tenant.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Tenant>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Tenants
            .AsNoTracking()
            .OrderBy(tenant => tenant.LastName)
            .ThenBy(tenant => tenant.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default)
    {
        await _dbContext.Tenants.AddAsync(tenant, cancellationToken);
    }
}
