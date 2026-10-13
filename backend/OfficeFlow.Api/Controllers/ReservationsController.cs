using MediatR;
using Microsoft.AspNetCore.Mvc;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Reservations.Commands.CreateReservation;

namespace OfficeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ReservationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReservationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateReservationResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateReservationResult>> Create(
        [FromBody] CreateReservationRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateReservationCommand(
            request.SpaceId,
            request.TenantId,
            request.StartTime,
            request.EndTime);

        try
        {
            var result = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(
                nameof(Create),
                new { id = result.ReservationId },
                result);
        }
        catch (NotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }
}

public sealed record CreateReservationRequest(
    Guid SpaceId,
    Guid TenantId,
    DateTime StartTime,
    DateTime EndTime);
