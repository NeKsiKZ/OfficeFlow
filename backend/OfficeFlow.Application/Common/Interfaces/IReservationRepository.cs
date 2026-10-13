using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Common.Interfaces;

public interface IReservationRepository
{
    Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default);
}
