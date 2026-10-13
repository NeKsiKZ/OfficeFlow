using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
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
}
