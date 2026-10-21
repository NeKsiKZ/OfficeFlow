using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Common.Interfaces;

public interface IReservationRepository
{
    Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default);

    Task<Reservation?> GetTrackedByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Reservation>> GetByTenantIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Reservation>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Reservations whose period overlaps [fromUtc, toUtc] (inclusive bounds).
    /// Null bounds mean open-ended on that side.
    /// </summary>
    Task<IReadOnlyList<Reservation>> GetForReportingAsync(
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Reservation>> GetConfirmedPastEndAsync(
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsForSpaceAsync(Guid spaceId, CancellationToken cancellationToken = default);
}
