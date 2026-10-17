using MediatR;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Exceptions;

namespace OfficeFlow.Application.Services.Commands.DeleteService;

public sealed class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand>
{
    private readonly IAdditionalServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceCommandHandler(
        IAdditionalServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetTrackedByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(AdditionalService), request.Id);

        if (await _serviceRepository.ExistsInAnyReservationAsync(service.Id, cancellationToken))
        {
            throw new DomainException(
                "Service cannot be deleted because it is used by existing reservations.");
        }

        await _serviceRepository.DeleteAsync(service, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
