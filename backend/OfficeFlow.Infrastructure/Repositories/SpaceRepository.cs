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

    public async Task<Space?> GetTrackedByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Spaces
            .FirstOrDefaultAsync(space => space.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Space>> GetAllAsync(
        SpaceType? type = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        CancellationToken cancellationToken = default)
    {
        var deskQuery = _dbContext.Set<Desk>().AsNoTracking();
        var roomQuery = _dbContext.Set<Room>().AsNoTracking();
        var parkingQuery = _dbContext.Set<ParkingSpace>().AsNoTracking();

        if (minPrice.HasValue)
        {
            deskQuery = deskQuery.Where(desk => desk.HourlyRate.Amount >= minPrice.Value);
            roomQuery = roomQuery.Where(room => room.MonthlySubscriptionRate.Amount >= minPrice.Value);
            parkingQuery = parkingQuery.Where(parking => parking.HourlyRate.Amount >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            deskQuery = deskQuery.Where(desk => desk.HourlyRate.Amount <= maxPrice.Value);
            roomQuery = roomQuery.Where(room => room.MonthlySubscriptionRate.Amount <= maxPrice.Value);
            parkingQuery = parkingQuery.Where(parking => parking.HourlyRate.Amount <= maxPrice.Value);
        }

        return type switch
        {
            SpaceType.Desk => await deskQuery.OrderBy(space => space.Name).ToListAsync(cancellationToken),
            SpaceType.Room => await roomQuery.OrderBy(space => space.Name).ToListAsync(cancellationToken),
            SpaceType.ParkingSpace => await parkingQuery.OrderBy(space => space.Name).ToListAsync(cancellationToken),
            _ => await CombineAllAsync(deskQuery, roomQuery, parkingQuery, cancellationToken)
        };
    }

    public async Task AddAsync(Space space, CancellationToken cancellationToken = default)
    {
        await _dbContext.Spaces.AddAsync(space, cancellationToken);
    }

    public Task DeleteAsync(Space space, CancellationToken cancellationToken = default)
    {
        _dbContext.Spaces.Remove(space);
        return Task.CompletedTask;
    }

    private static async Task<IReadOnlyList<Space>> CombineAllAsync(
        IQueryable<Desk> desks,
        IQueryable<Room> rooms,
        IQueryable<ParkingSpace> parkingSpaces,
        CancellationToken cancellationToken)
    {
        var deskList = await desks.ToListAsync(cancellationToken);
        var roomList = await rooms.ToListAsync(cancellationToken);
        var parkingList = await parkingSpaces.ToListAsync(cancellationToken);

        return deskList
            .Cast<Space>()
            .Concat(roomList)
            .Concat(parkingList)
            .OrderBy(space => space.Name)
            .ToList();
    }
}
