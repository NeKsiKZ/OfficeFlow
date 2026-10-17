namespace OfficeFlow.Application.Auth.Commands.Login;

public sealed record LoginResult(
    string Token,
    string Email,
    string Role,
    DateTime ExpiresAtUtc,
    Guid? TenantId);
