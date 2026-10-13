using MediatR;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Spaces.Commands.CreateSpace;

public sealed record CreateSpaceCommand(
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
    string Currency = "PLN") : IRequest<CreateSpaceResult>;
