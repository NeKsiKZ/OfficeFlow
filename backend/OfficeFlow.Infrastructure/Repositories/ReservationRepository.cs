using Microsoft.EntityFrameworkCore;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Infrastructure.Persistence;

namespace OfficeFlow.Infrastructure.Repositories;

public sealed class ReservationRepository : IReservationRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ReservationRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        await _dbContext.Reservations.AddAsync(reservation, cancellationToken);
    }

    public async Task<Reservation?> GetTrackedByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Reservations
            .FirstOrDefaultAsync(reservation => reservation.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Reservation>> GetByTenantIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Reservations
            .AsNoTracking()
            .Where(reservation => reservation.TenantId == tenantId)
            .OrderByDescending(reservation => reservation.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Reservation>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Reservations
            .AsNoTracking()
            .OrderByDescending(reservation => reservation.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Reservation>> GetForReportingAsync(
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Reservations.AsNoTracking();

        if (fromUtc.HasValue)
        {
            var from = NormalizeUtc(fromUtc.Value);
            query = query.Where(reservation => reservation.Period.EndUtc >= from);
        }

        if (toUtc.HasValue)
        {
            var to = NormalizeUtc(toUtc.Value);
            query = query.Where(reservation => reservation.Period.StartUtc <= to);
        }

        return await query
            .OrderByDescending(reservation => reservation.Period.StartUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Reservation>> GetConfirmedPastEndAsync(
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Reservations
            .Where(reservation =>
                reservation.Status == ReservationStatus.Confirmed &&
                reservation.Period.EndUtc <= utcNow)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsForSpaceAsync(Guid spaceId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Reservations
            .AsNoTracking()
            .AnyAsync(reservation => reservation.SpaceId == spaceId, cancellationToken);
    }

    private static DateTime NormalizeUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
}
