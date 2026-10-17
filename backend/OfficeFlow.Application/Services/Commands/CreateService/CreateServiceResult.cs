using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Services.Commands.CreateService;

public sealed record CreateServiceResult(
    Guid ServiceId,
    string Name,
    decimal Price,
    string Currency,
    IReadOnlyList<SpaceType> ApplicableSpaceTypes);
