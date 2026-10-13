using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;

namespace OfficeFlow.Infrastructure.Persistence.Configurations;

internal sealed class SpaceConfiguration : IEntityTypeConfiguration<Space>
{
    public void Configure(EntityTypeBuilder<Space> builder)
    {
        builder.ToTable("Spaces");

        builder.HasKey(space => space.Id);

        builder.Property(space => space.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(space => space.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(space => space.Code)
            .IsUnique();

        builder.Property(space => space.Description)
            .HasMaxLength(1000);

        builder.Property(space => space.IsActive)
            .IsRequired();

        // Computed in domain; TPH discriminator stores the concrete type instead.
        builder.Ignore(space => space.Type);

        builder.HasDiscriminator<SpaceType>("SpaceType")
            .HasValue<Desk>(SpaceType.Desk)
            .HasValue<Room>(SpaceType.Room)
            .HasValue<ParkingSpace>(SpaceType.ParkingSpace);
    }
}
