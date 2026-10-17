using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeFlow.Application.Common.Security;
using OfficeFlow.Application.Services.Commands.CreateService;
using OfficeFlow.Application.Services.Commands.DeleteService;
using OfficeFlow.Application.Services.Dtos;
using OfficeFlow.Application.Services.Queries.GetServices;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ServicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ServicesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdditionalServiceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AdditionalServiceDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetServicesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Manager)]
    [ProducesResponseType(typeof(CreateServiceResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateServiceResult>> Create(
        [FromBody] CreateServiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new CreateServiceCommand(
                request.Name,
                request.Price,
                request.ApplicableSpaceTypes,
                request.Description,
                request.Currency ?? "PLN"),
            cancellationToken);

        return Created($"/api/services/{result.ServiceId}", result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Manager)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteServiceCommand(id), cancellationToken);
        return NoContent();
    }
}

public sealed record CreateServiceRequest(
    string Name,
    decimal Price,
    IReadOnlyList<SpaceType> ApplicableSpaceTypes,
    string? Description = null,
    string? Currency = "PLN");
