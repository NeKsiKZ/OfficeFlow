using Microsoft.EntityFrameworkCore;
using OfficeFlow.Domain.Entities;

namespace OfficeFlow.Infrastructure.Persistence;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Space> Spaces => Set<Space>();
    public DbSet<Desk> Desks => Set<Desk>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<ParkingSpace> ParkingSpaces => Set<ParkingSpace>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
