using MediatR;

namespace OfficeFlow.Application.Reservations.Commands.ConfirmReservation;

public sealed record ConfirmReservationCommand(Guid Id) : IRequest;
