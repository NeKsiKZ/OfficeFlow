using MediatR;
using OfficeFlow.Application.Services.Dtos;

namespace OfficeFlow.Application.Services.Queries.GetServices;

public sealed record GetServicesQuery : IRequest<IReadOnlyList<AdditionalServiceDto>>;
