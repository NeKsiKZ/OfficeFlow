using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Services.Dtos;

public sealed record AdditionalServiceDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    string Currency,
    IReadOnlyList<SpaceType> ApplicableSpaceTypes);
