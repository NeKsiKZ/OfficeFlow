using MediatR;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Services.Dtos;
using OfficeFlow.Application.Services.Mappings;

namespace OfficeFlow.Application.Services.Queries.GetServices;

public sealed class GetServicesQueryHandler
    : IRequestHandler<GetServicesQuery, IReadOnlyList<AdditionalServiceDto>>
{
    private readonly IAdditionalServiceRepository _serviceRepository;

    public GetServicesQueryHandler(IAdditionalServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<IReadOnlyList<AdditionalServiceDto>> Handle(
        GetServicesQuery request,
        CancellationToken cancellationToken)
    {
        var services = await _serviceRepository.GetAllAsync(cancellationToken);
        return services.Select(service => service.ToDto()).ToList();
    }
}
