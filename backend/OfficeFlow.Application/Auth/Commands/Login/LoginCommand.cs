using MediatR;

namespace OfficeFlow.Application.Auth.Commands.Login;

public sealed record LoginCommand(string Email, string? Password = null)
    : IRequest<LoginResult>;
