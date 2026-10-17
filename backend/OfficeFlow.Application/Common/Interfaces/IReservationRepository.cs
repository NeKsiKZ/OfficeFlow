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

    Task<IReadOnlyList<Reservation>> GetConfirmedPastEndAsync(
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsForSpaceAsync(Guid spaceId, CancellationToken cancellationToken = default);
}
