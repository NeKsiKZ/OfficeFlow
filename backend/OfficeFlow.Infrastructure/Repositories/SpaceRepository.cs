using Microsoft.EntityFrameworkCore;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
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
            .AsNoTracking()
            .FirstOrDefaultAsync(space => space.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Space>> GetAllAsync(
        SpaceType? type = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Spaces.AsNoTracking();

        if (type.HasValue)
        {
            query = type.Value switch
            {
                SpaceType.Desk => query.OfType<Desk>(),
                SpaceType.Room => query.OfType<Room>(),
                SpaceType.ParkingSpace => query.OfType<ParkingSpace>(),
                _ => query.Where(_ => false)
            };
        }

        return await query
            .OrderBy(space => space.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Space space, CancellationToken cancellationToken = default)
    {
        await _dbContext.Spaces.AddAsync(space, cancellationToken);
    }
}
