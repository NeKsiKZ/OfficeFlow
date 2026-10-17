using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OfficeFlow.Application.Common.Interfaces;
using OfficeFlow.Application.Common.Options;
using OfficeFlow.Infrastructure.Auth;
using OfficeFlow.Infrastructure.Persistence;
using OfficeFlow.Infrastructure.Repositories;

namespace OfficeFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' was not found.");

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<ISpaceRepository, SpaceRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        return services;
    }
}
