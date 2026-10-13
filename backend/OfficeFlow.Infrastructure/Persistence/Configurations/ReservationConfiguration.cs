using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Infrastructure.Persistence.Configurations;

internal sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("Reservations");

        builder.HasKey(reservation => reservation.Id);

        builder.Property(reservation => reservation.TenantId)
            .IsRequired();

        builder.Property(reservation => reservation.SpaceId)
            .IsRequired();

        builder.Property(reservation => reservation.SpaceType)
            .IsRequired();

        builder.Property(reservation => reservation.Status)
            .IsRequired();

        builder.Property(reservation => reservation.CreatedAtUtc)
            .IsRequired();

        builder.Property(reservation => reservation.Notes)
            .HasMaxLength(1000);

        builder.OwnsOne(reservation => reservation.Period, period =>
        {
            period.Property(p => p.StartUtc)
                .HasColumnName("PeriodStartUtc")
                .IsRequired();

            period.Property(p => p.EndUtc)
                .HasColumnName("PeriodEndUtc")
                .IsRequired();

            period.Ignore(p => p.Duration);
            period.Ignore(p => p.DurationInHours);
            period.Ignore(p => p.DurationInDays);
        });

        builder.Navigation(reservation => reservation.Period).IsRequired();

        builder.OwnsOne(reservation => reservation.TotalCost, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TotalCostAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("TotalCostCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Navigation(reservation => reservation.TotalCost).IsRequired();

        builder.HasOne<Tenant>()
            .WithMany()
            .HasForeignKey(reservation => reservation.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Space>()
            .WithMany()
            .HasForeignKey(reservation => reservation.SpaceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(reservation => reservation.TenantId);
        builder.HasIndex(reservation => reservation.SpaceId);
        builder.HasIndex(reservation => new { reservation.SpaceId, reservation.Status });
    }
}
