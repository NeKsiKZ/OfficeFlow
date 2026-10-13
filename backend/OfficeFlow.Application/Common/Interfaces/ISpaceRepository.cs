using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Common.Interfaces;

public interface ISpaceRepository
{
    Task<Space?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Space space, CancellationToken cancellationToken = default);
}
