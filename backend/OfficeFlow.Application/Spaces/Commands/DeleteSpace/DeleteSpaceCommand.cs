using MediatR;

namespace OfficeFlow.Application.Spaces.Commands.DeleteSpace;

public sealed record DeleteSpaceCommand(Guid Id) : IRequest;
