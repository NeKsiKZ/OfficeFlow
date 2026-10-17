using MediatR;

namespace OfficeFlow.Application.Services.Commands.DeleteService;

public sealed record DeleteServiceCommand(Guid Id) : IRequest;
