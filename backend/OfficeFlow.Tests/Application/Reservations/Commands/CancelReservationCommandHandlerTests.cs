using FluentAssertions;
using Moq;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Common.Security;
using OfficeFlow.Application.Reservations.Commands.CancelReservation;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Tests.Application.Reservations.Commands;

public sealed class CancelReservationCommandHandlerTests
{
    private readonly Mock<IReservationRepository> _reservationRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private CancelReservationCommandHandler CreateHandler() =>
        new(_reservationRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_WhenManager_CancelsPendingReservation()
    {
        var reservation = CreatePendingReservation();

        _reservationRepository
            .Setup(repository => repository.GetTrackedByIdAsync(reservation.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(reservation);

        _unitOfWork
            .Setup(unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = CreateHandler();

        await handler.Handle(
            new CancelReservationCommand(reservation.Id, Roles.Manager, null),
            CancellationToken.None);

        reservation.Status.Should().Be(ReservationStatus.Cancelled);
    }

    [Fact]
    public async Task Handle_WhenOwnerTenant_CancelsConfirmedReservation()
    {
        var reservation = CreatePendingReservation();
        reservation.Confirm();

        _reservationRepository
            .Setup(repository => repository.GetTrackedByIdAsync(reservation.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(reservation);

        _unitOfWork
            .Setup(unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = CreateHandler();

        await handler.Handle(
            new CancelReservationCommand(reservation.Id, Roles.Tenant, reservation.TenantId),
            CancellationToken.None);

        reservation.Status.Should().Be(ReservationStatus.Cancelled);
    }

    [Fact]
    public async Task Handle_WhenTenantCancelsForeignReservation_ThrowsUnauthorizedAccessException()
    {
        var reservation = CreatePendingReservation();
        var foreignTenantId = Guid.NewGuid();

        _reservationRepository
            .Setup(repository => repository.GetTrackedByIdAsync(reservation.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(reservation);

        var handler = CreateHandler();
        var act = async () => await handler.Handle(
            new CancelReservationCommand(reservation.Id, Roles.Tenant, foreignTenantId),
            CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
        reservation.Status.Should().Be(ReservationStatus.Pending);
        _unitOfWork.Verify(
            unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    private static Reservation CreatePendingReservation()
    {
        var tenant = new Tenant("Jan", "Kowalski", "jan.kowalski@officeflow.local");
        var desk = new Desk("Biurko A1", "DESK-A1", new Money(25m));
        var start = DateTime.UtcNow.AddDays(1).AddHours(1);
        start = new DateTime(start.Year, start.Month, start.Day, start.Hour, 0, 0, DateTimeKind.Utc);
        var period = new DateRange(start, start.AddHours(2));
        return new Reservation(tenant, desk, period, clockUtc: DateTime.UtcNow);
    }
}
