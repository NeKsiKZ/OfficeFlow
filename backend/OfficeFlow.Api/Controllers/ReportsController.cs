using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeFlow.Application.Common.Security;
using OfficeFlow.Application.Reports.Dtos;
using OfficeFlow.Application.Reports.Queries.GetManagerStats;

namespace OfficeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Manager)]
public sealed class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Manager dashboard: revenue, booking counts, occupancy, and breakdowns.
    /// Optional fromUtc/toUtc filter reservations whose period overlaps the range.
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(ManagerStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ManagerStatsDto>> GetStats(
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        CancellationToken cancellationToken)
    {
        var stats = await _mediator.Send(
            new GetManagerStatsQuery(fromUtc, toUtc),
            cancellationToken);

        return Ok(stats);
    }

    /// <summary>
    /// Alias of <see cref="GetStats"/> kept for the existing /api/reports/revenue route.
    /// </summary>
    [HttpGet("revenue")]
    [ProducesResponseType(typeof(ManagerStatsDto), StatusCodes.Status200OK)]
    public Task<ActionResult<ManagerStatsDto>> GetRevenueReport(
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        CancellationToken cancellationToken) =>
        GetStats(fromUtc, toUtc, cancellationToken);
}
