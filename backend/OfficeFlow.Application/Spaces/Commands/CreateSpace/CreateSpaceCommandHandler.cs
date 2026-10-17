using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
using OfficeFlow.Domain.Exceptions;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Application.Spaces.Commands.CreateSpace;

public sealed class CreateSpaceCommandHandler
    : IRequestHandler<CreateSpaceCommand, CreateSpaceResult>
{
    private readonly ISpaceRepository _spaceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateSpaceCommandHandler(
        ISpaceRepository spaceRepository,
        IUnitOfWork unitOfWork)
    {
        _spaceRepository = spaceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateSpaceResult> Handle(
        CreateSpaceCommand request,
        CancellationToken cancellationToken)
    {
        var space = CreateSpace(request);

        await _spaceRepository.AddAsync(space, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateSpaceResult(space.Id, space.Name, space.Code, space.Type);
    }

    private static Space CreateSpace(CreateSpaceCommand request) =>
        request.Type switch
        {
            SpaceType.Desk => new Desk(
                request.Name,
                request.Code,
                new Money(request.HourlyRate!.Value, request.Currency),
                request.Floor,
                request.Zone,
                request.Description,
                request.FloorNumber),

            SpaceType.Room => new Room(
                request.Name,
                request.Code,
                new Money(request.MonthlySubscriptionRate!.Value, request.Currency),
                request.AreaSquareMeters!.Value,
                request.Capacity!.Value,
                request.Description,
                request.FloorNumber),

            SpaceType.ParkingSpace => new ParkingSpace(
                request.Name,
                request.Code,
                request.SpotNumber!,
                new Money(request.HourlyRate!.Value, request.Currency),
                request.Level,
                request.Description,
                request.FloorNumber),

            _ => throw new DomainException($"Unsupported space type '{request.Type}'.")
        };
}
