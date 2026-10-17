namespace OfficeFlow.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(
        string subject,
        string email,
        string role,
        Guid? tenantId = null,
        DateTime? expiresAtUtc = null);
}
