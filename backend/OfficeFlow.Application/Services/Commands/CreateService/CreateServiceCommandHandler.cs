using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Application.Services.Commands.CreateService;

public sealed class CreateServiceCommandHandler
    : IRequestHandler<CreateServiceCommand, CreateServiceResult>
{
    private readonly IAdditionalServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceCommandHandler(
        IAdditionalServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateServiceResult> Handle(
        CreateServiceCommand request,
        CancellationToken cancellationToken)
    {
        var service = new AdditionalService(
            request.Name,
            new Money(request.Price, request.Currency),
            request.ApplicableSpaceTypes,
            request.Description);

        await _serviceRepository.AddAsync(service, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateServiceResult(
            service.Id,
            service.Name,
            service.Price.Amount,
            service.Price.Currency,
            service.ApplicableSpaceTypes.ToList());
    }
}
