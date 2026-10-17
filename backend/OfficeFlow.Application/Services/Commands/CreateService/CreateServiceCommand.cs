using MediatR;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Services.Commands.CreateService;

public sealed record CreateServiceCommand(
    string Name,
    decimal Price,
    IReadOnlyList<SpaceType> ApplicableSpaceTypes,
    string? Description = null,
    string Currency = "PLN") : IRequest<CreateServiceResult>;
