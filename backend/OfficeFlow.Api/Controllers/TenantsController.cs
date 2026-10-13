using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using OfficeFlow.Application.Tenants.Commands.CreateTenant;
using OfficeFlow.Domain.Exceptions;

namespace OfficeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TenantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TenantsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateTenantResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateTenantResult>> Create(
        [FromBody] CreateTenantRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateTenantCommand(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber,
            request.CompanyName);

        try
        {
            var result = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(Create), new { id = result.TenantId }, result);
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

public sealed record CreateTenantRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber = null,
    string? CompanyName = null);
