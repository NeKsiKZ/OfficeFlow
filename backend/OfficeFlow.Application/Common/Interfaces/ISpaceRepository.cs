using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Common.Interfaces;

public interface ISpaceRepository
{
    Task<Space?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Space?> GetTrackedByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Space>> GetAllAsync(
        SpaceType? type = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(Space space, CancellationToken cancellationToken = default);

    Task DeleteAsync(Space space, CancellationToken cancellationToken = default);
}
