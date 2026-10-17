using OfficeFlow.Application.Services.Dtos;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Application.Services.Mappings;

public static class AdditionalServiceMappings
{
    public static AdditionalServiceDto ToDto(this AdditionalService service) =>
        new(
            service.Id,
            service.Name,
            service.Description,
            service.Price.Amount,
            service.Price.Currency,
            service.ApplicableSpaceTypes.ToList());
}
