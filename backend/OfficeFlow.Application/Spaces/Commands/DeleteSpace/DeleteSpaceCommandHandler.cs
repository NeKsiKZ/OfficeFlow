using MediatR;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Exceptions;

namespace OfficeFlow.Application.Spaces.Commands.DeleteSpace;

public sealed class DeleteSpaceCommandHandler : IRequestHandler<DeleteSpaceCommand>
{
    private readonly ISpaceRepository _spaceRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteSpaceCommandHandler(
        ISpaceRepository spaceRepository,
        IReservationRepository reservationRepository,
        IUnitOfWork unitOfWork)
    {
        _spaceRepository = spaceRepository;
        _reservationRepository = reservationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteSpaceCommand request, CancellationToken cancellationToken)
    {
        var space = await _spaceRepository.GetTrackedByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Space), request.Id);

        if (await _reservationRepository.ExistsForSpaceAsync(space.Id, cancellationToken))
        {
            throw new DomainException(
                "Space cannot be deleted because it has existing reservations.");
        }

        await _spaceRepository.DeleteAsync(space, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
