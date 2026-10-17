using MediatR;
using OfficeFlow.Application.Spaces.Dtos;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Spaces.Queries.GetSpaces;

public sealed record GetSpacesQuery(SpaceType? Type = null)
    : IRequest<IReadOnlyList<SpaceDto>>;
