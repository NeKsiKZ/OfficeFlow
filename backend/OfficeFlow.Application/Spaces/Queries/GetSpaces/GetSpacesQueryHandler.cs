using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Spaces.Dtos;
using OfficeFlow.Application.Spaces.Mappings;

namespace OfficeFlow.Application.Spaces.Queries.GetSpaces;

public sealed class GetSpacesQueryHandler
    : IRequestHandler<GetSpacesQuery, IReadOnlyList<SpaceDto>>
{
    private readonly ISpaceRepository _spaceRepository;

    public GetSpacesQueryHandler(ISpaceRepository spaceRepository)
    {
        _spaceRepository = spaceRepository;
    }

    public async Task<IReadOnlyList<SpaceDto>> Handle(
        GetSpacesQuery request,
        CancellationToken cancellationToken)
    {
        var spaces = await _spaceRepository.GetAllAsync(request.Type, cancellationToken);
        return spaces.Select(space => space.ToDto()).ToList();
    }
}
