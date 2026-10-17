using MediatR;
using OfficeFlow.Application.Reservations.Dtos;

namespace OfficeFlow.Application.Reservations.Queries.GetAllReservations;

public sealed record GetAllReservationsQuery : IRequest<IReadOnlyList<ReservationDto>>;
