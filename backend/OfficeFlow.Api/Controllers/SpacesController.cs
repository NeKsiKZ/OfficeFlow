using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Spaces.Commands.CreateSpace;
using OfficeFlow.Application.Spaces.Dtos;
using OfficeFlow.Application.Spaces.Queries.GetSpaceById;
using OfficeFlow.Application.Spaces.Queries.GetSpaces;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;

namespace OfficeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SpacesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SpacesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SpaceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SpaceDto>>> GetAll(
        [FromQuery] SpaceType? type,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetSpacesQuery(type), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SpaceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SpaceDto>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _mediator.Send(new GetSpaceByIdQuery(id), cancellationToken);
            return Ok(result);
        }
        catch (NotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateSpaceResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateSpaceResult>> Create(
        [FromBody] CreateSpaceRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateSpaceCommand(
            request.Name,
            request.Code,
            request.Type,
            request.HourlyRate,
            request.MonthlySubscriptionRate,
            request.AreaSquareMeters,
            request.Capacity,
            request.SpotNumber,
            request.Floor,
            request.Zone,
            request.Level,
            request.Description,
            request.Currency ?? "PLN");

        try
        {
            var result = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.SpaceId }, result);
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

public sealed record CreateSpaceRequest(
    string Name,
    string Code,
    SpaceType Type,
    decimal? HourlyRate = null,
    decimal? MonthlySubscriptionRate = null,
    decimal? AreaSquareMeters = null,
    int? Capacity = null,
    string? SpotNumber = null,
    string? Floor = null,
    string? Zone = null,
    string? Level = null,
    string? Description = null,
    string? Currency = "PLN");
