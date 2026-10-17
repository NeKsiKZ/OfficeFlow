using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Common.Interfaces;

public interface ISpaceRepository
{
    Task<Space?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Space>> GetAllAsync(
        SpaceType? type = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(Space space, CancellationToken cancellationToken = default);
}
