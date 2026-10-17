using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Reservations.Commands.CreateReservation;
using OfficeFlow.Application.Reservations.Dtos;
using OfficeFlow.Application.Reservations.Queries.GetReservationsByTenant;
using OfficeFlow.Domain.Exceptions;

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

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ReservationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<ReservationDto>>> GetByTenant(
        [FromQuery] Guid tenantId,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _mediator.Send(
                new GetReservationsByTenantQuery(tenantId),
                cancellationToken);

            return Ok(result);
        }
        catch (ValidationException exception)
        {
            return BadRequest(new { errors = exception.Errors.Select(error => error.ErrorMessage) });
        }
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
            return Created(
                $"/api/reservations?tenantId={result.TenantId}",
                result);
        }
        catch (NotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (ValidationException exception)
        {
            return BadRequest(new { errors = exception.Errors.Select(error => error.ErrorMessage) });
        }
        catch (DomainException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}

public sealed record CreateReservationRequest(
    Guid SpaceId,
    Guid TenantId,
    DateTime StartTime,
    DateTime EndTime);
