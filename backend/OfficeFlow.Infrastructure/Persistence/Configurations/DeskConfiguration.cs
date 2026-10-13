using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Infrastructure.Persistence.Configurations;

internal sealed class DeskConfiguration : IEntityTypeConfiguration<Desk>
{
    public void Configure(EntityTypeBuilder<Desk> builder)
    {
        builder.Property(desk => desk.Floor)
            .HasMaxLength(50);

        builder.Property(desk => desk.Zone)
            .HasMaxLength(50);

        builder.OwnsOne(desk => desk.HourlyRate, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("HourlyRateAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("HourlyRateCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Navigation(desk => desk.HourlyRate).IsRequired();
    }
}
