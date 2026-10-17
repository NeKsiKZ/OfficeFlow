using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OfficeFlow.Application.Common.Interfaces;

namespace OfficeFlow.Infrastructure.Background;

/// <summary>
/// Periodically marks confirmed reservations as Completed after Period.EndUtc.
/// </summary>
public sealed class ReservationCompletionService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReservationCompletionService> _logger;

    public ReservationCompletionService(
        IServiceScopeFactory scopeFactory,
        ILogger<ReservationCompletionService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Reservation completion background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CompleteDueReservationsAsync(stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                _logger.LogError(exception, "Failed to auto-complete due reservations.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task CompleteDueReservationsAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var reservationRepository = scope.ServiceProvider.GetRequiredService<IReservationRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var utcNow = DateTime.UtcNow;
        var dueReservations = await reservationRepository.GetConfirmedPastEndAsync(
            utcNow,
            cancellationToken);

        if (dueReservations.Count == 0)
        {
            return;
        }

        var completedCount = 0;
        foreach (var reservation in dueReservations)
        {
            if (reservation.TryCompleteIfDue(utcNow))
            {
                completedCount++;
            }
        }

        if (completedCount > 0)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Auto-completed {Count} reservation(s) past end time.",
                completedCount);
        }
    }
}
