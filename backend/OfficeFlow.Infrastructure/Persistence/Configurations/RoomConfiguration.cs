using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Infrastructure.Persistence.Configurations;

internal sealed class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.Property(room => room.AreaSquareMeters)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(room => room.Capacity)
            .IsRequired();

        builder.OwnsOne(room => room.MonthlySubscriptionRate, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("MonthlySubscriptionRateAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("MonthlySubscriptionRateCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Navigation(room => room.MonthlySubscriptionRate).IsRequired();
    }
}
