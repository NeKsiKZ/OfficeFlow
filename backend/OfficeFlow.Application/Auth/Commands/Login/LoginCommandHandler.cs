using MediatR;
using Microsoft.Extensions.Options;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Common.Options;
using OfficeFlow.Application.Common.Security;

namespace OfficeFlow.Application.Auth.Commands.Login;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResult>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly JwtSettings _jwtSettings;

    public LoginCommandHandler(
        ITenantRepository tenantRepository,
        IJwtTokenService jwtTokenService,
        IOptions<JwtSettings> jwtSettings)
    {
        _tenantRepository = tenantRepository;
        _jwtTokenService = jwtTokenService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

        if (email.Equals(_jwtSettings.ManagerEmail.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            // Passwordless demo login for the configured manager account.
            var managerToken = _jwtTokenService.GenerateToken(
                subject: "manager",
                email: email,
                role: Roles.Manager,
                expiresAtUtc: expiresAtUtc);

            return new LoginResult(managerToken, email, Roles.Manager, expiresAtUtc, null);
        }

        var tenant = await _tenantRepository.GetByEmailAsync(email, cancellationToken)
            ?? throw new NotFoundException("User", email);

        if (!tenant.IsActive)
        {
            throw new UnauthorizedAccessException("Tenant account is inactive.");
        }

        // Passwordless demo login: identity is resolved solely by tenant email.
        var tenantToken = _jwtTokenService.GenerateToken(
            subject: tenant.Id.ToString(),
            email: tenant.Email,
            role: Roles.Tenant,
            tenantId: tenant.Id,
            expiresAtUtc: expiresAtUtc);

        return new LoginResult(tenantToken, tenant.Email, Roles.Tenant, expiresAtUtc, tenant.Id);
    }
}
