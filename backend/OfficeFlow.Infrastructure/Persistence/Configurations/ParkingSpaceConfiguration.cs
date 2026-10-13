using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Infrastructure.Persistence.Configurations;

internal sealed class ParkingSpaceConfiguration : IEntityTypeConfiguration<ParkingSpace>
{
    public void Configure(EntityTypeBuilder<ParkingSpace> builder)
    {
        builder.Property(parking => parking.SpotNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(parking => parking.SpotNumber)
            .IsUnique();

        builder.Property(parking => parking.Level)
            .HasMaxLength(50);

        builder.OwnsOne(parking => parking.HourlyRate, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("ParkingHourlyRateAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("ParkingHourlyRateCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Navigation(parking => parking.HourlyRate).IsRequired();
    }
}
