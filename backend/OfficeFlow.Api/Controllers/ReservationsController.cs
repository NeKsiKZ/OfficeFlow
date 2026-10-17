using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeFlow.Application.Common.Security;
using OfficeFlow.Application.Reservations.Commands.CancelReservation;
using OfficeFlow.Application.Reservations.Commands.ConfirmReservation;
using OfficeFlow.Application.Reservations.Commands.CreateReservation;
using OfficeFlow.Application.Reservations.Dtos;
using OfficeFlow.Application.Reservations.Queries.GetAllReservations;
using OfficeFlow.Application.Reservations.Queries.GetReservationsByTenant;

namespace OfficeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ReservationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReservationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ReservationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ReservationDto>>> Get(
        [FromQuery] Guid? tenantId,
        CancellationToken cancellationToken)
    {
        if (User.IsInRole(Roles.Manager) && tenantId is null)
        {
            var all = await _mediator.Send(new GetAllReservationsQuery(), cancellationToken);
            return Ok(all);
        }

        if (tenantId is null)
        {
            return BadRequest(new { message = "tenantId query parameter is required." });
        }

        if (User.IsInRole(Roles.Tenant))
        {
            var actorTenantId = GetTenantIdFromClaims();
            if (actorTenantId is null || actorTenantId != tenantId)
            {
                return Forbid();
            }
        }

        var result = await _mediator.Send(
            new GetReservationsByTenantQuery(tenantId.Value),
            cancellationToken);

        return Ok(result);
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
            request.EndTime,
            request.ServiceIds);

        var result = await _mediator.Send(command, cancellationToken);
        return Created(
            $"/api/reservations?tenantId={result.TenantId}",
            result);
    }

    [HttpPost("{id:guid}/confirm")]
    [Authorize(Roles = Roles.Manager)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Confirm(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new ConfirmReservationCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var role = User.IsInRole(Roles.Manager)
            ? Roles.Manager
            : User.IsInRole(Roles.Tenant)
                ? Roles.Tenant
                : null;

        if (role is null)
        {
            return Forbid();
        }

        await _mediator.Send(
            new CancelReservationCommand(id, role, GetTenantIdFromClaims()),
            cancellationToken);

        return NoContent();
    }

    private Guid? GetTenantIdFromClaims()
    {
        var raw = User.FindFirstValue("tenantId");
        return Guid.TryParse(raw, out var tenantId) ? tenantId : null;
    }
}

public sealed record CreateReservationRequest(
    Guid SpaceId,
    Guid TenantId,
    DateTime StartTime,
    DateTime EndTime,
    IReadOnlyList<Guid>? ServiceIds = null);
