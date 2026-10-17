using Microsoft.EntityFrameworkCore;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Infrastructure.Persistence;

namespace OfficeFlow.Infrastructure.Repositories;

public sealed class AdditionalServiceRepository : IAdditionalServiceRepository
{
    private readonly ApplicationDbContext _dbContext;

    public AdditionalServiceRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<AdditionalService>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.AdditionalServices
            .AsNoTracking()
            .OrderBy(service => service.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AdditionalService>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken cancellationToken = default)
    {
        var idList = ids.Distinct().ToList();
        if (idList.Count == 0)
        {
            return [];
        }

        return await _dbContext.AdditionalServices
            .Where(service => idList.Contains(service.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<AdditionalService?> GetTrackedByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.AdditionalServices
            .FirstOrDefaultAsync(service => service.Id == id, cancellationToken);
    }

    public async Task AddAsync(AdditionalService service, CancellationToken cancellationToken = default)
    {
        await _dbContext.AdditionalServices.AddAsync(service, cancellationToken);
    }

    public Task DeleteAsync(AdditionalService service, CancellationToken cancellationToken = default)
    {
        _dbContext.AdditionalServices.Remove(service);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsInAnyReservationAsync(
        Guid serviceId,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.Reservations
            .AsNoTracking()
            .AnyAsync(
                reservation => reservation.AdditionalServices.Any(service => service.Id == serviceId),
                cancellationToken);
    }
}
