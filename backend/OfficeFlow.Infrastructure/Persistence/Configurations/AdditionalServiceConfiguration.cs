using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Infrastructure.Persistence.Configurations;

internal sealed class AdditionalServiceConfiguration : IEntityTypeConfiguration<AdditionalService>
{
    public void Configure(EntityTypeBuilder<AdditionalService> builder)
    {
        builder.ToTable("AdditionalServices");

        builder.HasKey(service => service.Id);

        builder.Property(service => service.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(service => service.Description)
            .HasMaxLength(1000);

        builder.OwnsOne(service => service.Price, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("PriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("PriceCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Navigation(service => service.Price).IsRequired();

        builder.PrimitiveCollection(service => service.ApplicableSpaceTypes)
            .ElementType()
            .HasConversion<int>();

        builder.Navigation(service => service.Reservations)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(service => service.Name);
    }
}
