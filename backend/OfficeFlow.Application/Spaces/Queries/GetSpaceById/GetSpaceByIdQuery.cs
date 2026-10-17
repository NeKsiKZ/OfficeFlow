using MediatR;
using OfficeFlow.Application.Spaces.Dtos;

namespace OfficeFlow.Application.Spaces.Queries.GetSpaceById;

public sealed record GetSpaceByIdQuery(Guid Id) : IRequest<SpaceDto>;
