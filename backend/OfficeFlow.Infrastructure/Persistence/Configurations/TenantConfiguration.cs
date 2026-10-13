using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Infrastructure.Persistence.Configurations;

internal sealed class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");

        builder.HasKey(tenant => tenant.Id);

        builder.Property(tenant => tenant.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(tenant => tenant.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(tenant => tenant.Email)
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(tenant => tenant.Email)
            .IsUnique();

        builder.Property(tenant => tenant.PhoneNumber)
            .HasMaxLength(50);

        builder.Property(tenant => tenant.CompanyName)
            .HasMaxLength(200);

        builder.Property(tenant => tenant.IsActive)
            .IsRequired();

        builder.Ignore(tenant => tenant.FullName);
    }
}
