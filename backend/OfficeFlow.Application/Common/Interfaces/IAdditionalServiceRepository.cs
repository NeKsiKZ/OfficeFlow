using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Common.Interfaces;

public interface IAdditionalServiceRepository
{
    Task<IReadOnlyList<AdditionalService>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdditionalService>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken cancellationToken = default);

    Task<AdditionalService?> GetTrackedByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(AdditionalService service, CancellationToken cancellationToken = default);

    Task DeleteAsync(AdditionalService service, CancellationToken cancellationToken = default);

    Task<bool> ExistsInAnyReservationAsync(Guid serviceId, CancellationToken cancellationToken = default);
}
