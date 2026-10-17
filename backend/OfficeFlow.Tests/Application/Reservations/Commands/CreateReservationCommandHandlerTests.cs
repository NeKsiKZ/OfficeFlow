using FluentAssertions;
using Moq;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Reservations.Commands.CreateReservation;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Tests.Application.Reservations.Commands;

public sealed class CreateReservationCommandHandlerTests
{
    private readonly Mock<ISpaceRepository> _spaceRepository = new();
    private readonly Mock<ITenantRepository> _tenantRepository = new();
    private readonly Mock<IReservationRepository> _reservationRepository = new();
    private readonly Mock<IAdditionalServiceRepository> _serviceRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private CreateReservationCommandHandler CreateHandler() =>
        new(
            _spaceRepository.Object,
            _tenantRepository.Object,
            _reservationRepository.Object,
            _serviceRepository.Object,
            _unitOfWork.Object);

    [Fact]
    public async Task Handle_WithValidData_CreatesReservationAndPersistsIt()
    {
        // Arrange
        var tenant = CreateTenant();
        var desk = CreateDesk(hourlyRate: 25m);
        var start = FutureHourStart(hoursAhead: 24);
        var end = start.AddHours(2);

        _spaceRepository
            .Setup(repository => repository.GetByIdAsync(desk.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(desk);

        _tenantRepository
            .Setup(repository => repository.GetByIdAsync(tenant.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        Reservation? capturedReservation = null;
        _reservationRepository
            .Setup(repository => repository.AddAsync(It.IsAny<Reservation>(), It.IsAny<CancellationToken>()))
            .Callback<Reservation, CancellationToken>((reservation, _) => capturedReservation = reservation)
            .Returns(Task.CompletedTask);

        _unitOfWork
            .Setup(unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = CreateHandler();
        var command = new CreateReservationCommand(desk.Id, tenant.Id, start, end);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.SpaceId.Should().Be(desk.Id);
        result.TenantId.Should().Be(tenant.Id);
        result.StartTimeUtc.Should().Be(start);
        result.EndTimeUtc.Should().Be(end);
        result.Status.Should().Be(ReservationStatus.Pending);
        result.Currency.Should().Be("PLN");

        capturedReservation.Should().NotBeNull();
        capturedReservation!.SpaceId.Should().Be(desk.Id);
        capturedReservation.TenantId.Should().Be(tenant.Id);
        capturedReservation.Status.Should().Be(ReservationStatus.Pending);

        _reservationRepository.Verify(
            repository => repository.AddAsync(It.IsAny<Reservation>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _unitOfWork.Verify(
            unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithDeskAndAdditionalServices_CalculatesTotalCostAsSpacePlusServices()
    {
        // Arrange
        // Desk: 25 PLN/h × 2 h = 50 PLN
        // Services: parking 50 + locker 20 = 70 PLN
        // Expected total: 120 PLN
        var tenant = CreateTenant();
        var desk = CreateDesk(hourlyRate: 25m);
        var parking = new AdditionalService(
            "Parking podziemny",
            new Money(50m),
            [SpaceType.Desk, SpaceType.Room]);
        var locker = new AdditionalService(
            "Szafka",
            new Money(20m),
            [SpaceType.Desk, SpaceType.Room]);
        var start = FutureHourStart(hoursAhead: 24);
        var end = start.AddHours(2);
        var serviceIds = new[] { parking.Id, locker.Id };

        _spaceRepository
            .Setup(repository => repository.GetByIdAsync(desk.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(desk);

        _tenantRepository
            .Setup(repository => repository.GetByIdAsync(tenant.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        _serviceRepository
            .Setup(repository => repository.GetByIdsAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AdditionalService> { parking, locker });

        _reservationRepository
            .Setup(repository => repository.AddAsync(It.IsAny<Reservation>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _unitOfWork
            .Setup(unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = CreateHandler();
        var command = new CreateReservationCommand(
            desk.Id,
            tenant.Id,
            start,
            end,
            serviceIds);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.TotalCostAmount.Should().Be(120m);
        result.Currency.Should().Be("PLN");
    }

    [Fact]
    public async Task Handle_WithRoomAndAdditionalServices_MultipliesServicePricesByMonths()
    {
        // Room: 2000 PLN/month × 3 = 6000
        // Services: (50 + 20) × 3 months = 210
        // Expected total: 6210
        var tenant = CreateTenant();
        var room = new Room("Gabinet 1", "ROOM-1", new Money(2000m), 22m, 4);
        var parking = new AdditionalService(
            "Parking podziemny",
            new Money(50m),
            [SpaceType.Desk, SpaceType.Room]);
        var locker = new AdditionalService(
            "Szafka",
            new Money(20m),
            [SpaceType.Desk, SpaceType.Room]);
        var start = new DateTime(
            DateTime.UtcNow.Year,
            DateTime.UtcNow.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc).AddMonths(1);
        var end = start.AddMonths(3);
        var serviceIds = new[] { parking.Id, locker.Id };

        _spaceRepository
            .Setup(repository => repository.GetByIdAsync(room.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);

        _tenantRepository
            .Setup(repository => repository.GetByIdAsync(tenant.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        _serviceRepository
            .Setup(repository => repository.GetByIdsAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AdditionalService> { parking, locker });

        _reservationRepository
            .Setup(repository => repository.AddAsync(It.IsAny<Reservation>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _unitOfWork
            .Setup(unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = CreateHandler();
        var command = new CreateReservationCommand(
            room.Id,
            tenant.Id,
            start,
            end,
            serviceIds);

        var result = await handler.Handle(command, CancellationToken.None);

        result.TotalCostAmount.Should().Be(6210m);
        result.Currency.Should().Be("PLN");
    }

    [Fact]
    public async Task Handle_WhenSpaceDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var missingSpaceId = Guid.NewGuid();
        var tenant = CreateTenant();
        var start = FutureHourStart(hoursAhead: 24);
        var end = start.AddHours(2);

        _spaceRepository
            .Setup(repository => repository.GetByIdAsync(missingSpaceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Space?)null);

        var handler = CreateHandler();
        var command = new CreateReservationCommand(missingSpaceId, tenant.Id, start, end);

        // Act
        var act = async () => await handler.Handle(command, CancellationToken.None);

        // Assert
        var exception = await act.Should().ThrowAsync<NotFoundException>();
        exception.Which.EntityName.Should().Be(nameof(Space));
        exception.Which.Key.Should().Be(missingSpaceId);

        _reservationRepository.Verify(
            repository => repository.AddAsync(It.IsAny<Reservation>(), It.IsAny<CancellationToken>()),
            Times.Never);
        _unitOfWork.Verify(
            unitOfWork => unitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    private static Tenant CreateTenant() =>
        new(
            firstName: "Jan",
            lastName: "Kowalski",
            email: "jan.kowalski@officeflow.local");

    private static Desk CreateDesk(decimal hourlyRate) =>
        new(
            name: "Biurko A1",
            code: "DESK-A1",
            hourlyRate: new Money(hourlyRate));

    private static DateTime FutureHourStart(int hoursAhead)
    {
        var start = DateTime.UtcNow.AddHours(hoursAhead);
        return new DateTime(
            start.Year,
            start.Month,
            start.Day,
            start.Hour,
            0,
            0,
            DateTimeKind.Utc);
    }
}
