using FluentAssertions;
using Moq;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Reservations.Commands.ConfirmReservation;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Tests.Application.Reservations.Commands;

public sealed class ConfirmReservationCommandHandlerTests
{
    private readonly Mock<IReservationRepository> _reservationRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private ConfirmReservationCommandHandler CreateHandler() =>
        new(_reservationRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_WhenPending_ConfirmsReservation()
    {
        var reservation = CreatePendingReservation();

        _reservationRepository
            .Setup(repository => repository.GetTrackedByIdAsync(reservation.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(reservation);

        _unitOfWork
            .Setup(unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = CreateHandler();

        await handler.Handle(new ConfirmReservationCommand(reservation.Id), CancellationToken.None);

        reservation.Status.Should().Be(ReservationStatus.Confirmed);
        _unitOfWork.Verify(
            unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenReservationMissing_ThrowsNotFoundException()
    {
        var missingId = Guid.NewGuid();

        _reservationRepository
            .Setup(repository => repository.GetTrackedByIdAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Reservation?)null);

        var handler = CreateHandler();
        var act = async () => await handler.Handle(
            new ConfirmReservationCommand(missingId),
            CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
        _unitOfWork.Verify(
            unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WhenAlreadyConfirmed_ThrowsDomainException()
    {
        var reservation = CreatePendingReservation();
        reservation.Confirm();

        _reservationRepository
            .Setup(repository => repository.GetTrackedByIdAsync(reservation.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(reservation);

        var handler = CreateHandler();
        var act = async () => await handler.Handle(
            new ConfirmReservationCommand(reservation.Id),
            CancellationToken.None);

        await act.Should().ThrowAsync<DomainException>();
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
