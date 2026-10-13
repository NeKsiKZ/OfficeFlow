using Microsoft.EntityFrameworkCore;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Infrastructure.Persistence;

namespace OfficeFlow.Infrastructure.Repositories;

public sealed class SpaceRepository : ISpaceRepository
{
    private readonly ApplicationDbContext _dbContext;

    public SpaceRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Space?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Spaces
            .FirstOrDefaultAsync(space => space.Id == id, cancellationToken);
    }

    public async Task AddAsync(Space space, CancellationToken cancellationToken = default)
    {
        await _dbContext.Spaces.AddAsync(space, cancellationToken);
    }
}
