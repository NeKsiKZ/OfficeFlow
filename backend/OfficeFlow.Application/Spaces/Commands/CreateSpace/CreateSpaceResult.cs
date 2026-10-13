using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Application.Spaces.Commands.CreateSpace;

public sealed record CreateSpaceResult(
    Guid SpaceId,
    string Name,
    string Code,
    SpaceType Type);
