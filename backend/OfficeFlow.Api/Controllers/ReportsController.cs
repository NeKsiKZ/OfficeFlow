using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeFlow.Application.Common.Security;

namespace OfficeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Manager)]
public sealed class ReportsController : ControllerBase
{
    [HttpGet("revenue")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<object> GetRevenueReport()
    {
        return Ok(new
        {
            message = "Revenue report endpoint is reserved for managers.",
            generatedAtUtc = DateTime.UtcNow
        });
    }
}
