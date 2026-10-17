using MediatR;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Spaces.Dtos;
using OfficeFlow.Application.Spaces.Mappings;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Spaces.Queries.GetSpaceById;

public sealed class GetSpaceByIdQueryHandler : IRequestHandler<GetSpaceByIdQuery, SpaceDto>
{
    private readonly ISpaceRepository _spaceRepository;

    public GetSpaceByIdQueryHandler(ISpaceRepository spaceRepository)
    {
        _spaceRepository = spaceRepository;
    }

    public async Task<SpaceDto> Handle(
        GetSpaceByIdQuery request,
        CancellationToken cancellationToken)
    {
        var space = await _spaceRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Space), request.Id);

        return space.ToDto();
    }
}
