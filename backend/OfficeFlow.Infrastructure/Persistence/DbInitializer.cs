using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.ValueObjects;

namespace OfficeFlow.Infrastructure.Persistence;

public static class DbInitializer
{
    /// <summary>
    /// Demo accounts (passwordless JWT login ignores password, but keep them for documentation):
    /// Manager: manager@officeflow.local / Manager123!
    /// Tenant:  jan.kowalski@officeflow.local / Tenant123!
    /// Tenant:  anna.nowak@officeflow.local / Tenant123!
    /// </summary>
    public static void Initialize(ApplicationDbContext context)
    {
        if (context.Spaces.Any() || context.Tenants.Any())
        {
            return;
        }

        var tenants = new[]
        {
            new Tenant(
                firstName: "Jan",
                lastName: "Kowalski",
                email: "jan.kowalski@officeflow.local",
                phoneNumber: "+48 500 100 200",
                companyName: "Kowalski Consulting"),
            new Tenant(
                firstName: "Anna",
                lastName: "Nowak",
                email: "anna.nowak@officeflow.local",
                phoneNumber: "+48 501 200 300",
                companyName: "Nowak Design Studio")
        };

        var desks = new[]
        {
            new Desk("Biurko A1", "DESK-A1", new Money(25m), floor: "1", zone: "Open Space North"),
            new Desk("Biurko A2", "DESK-A2", new Money(25m), floor: "1", zone: "Open Space North"),
            new Desk("Biurko B1", "DESK-B1", new Money(28m), floor: "1", zone: "Open Space South"),
            new Desk("Biurko B2", "DESK-B2", new Money(28m), floor: "1", zone: "Open Space South"),
            new Desk("Biurko C1", "DESK-C1", new Money(22m), floor: "1", zone: "Open Space Center")
        };

        var rooms = new[]
        {
            new Room(
                "Gabinet Premium",
                "ROOM-PREMIUM",
                new Money(3500m),
                areaSquareMeters: 28m,
                capacity: 4,
                description: "Private cabinet with meeting table and natural light."),
            new Room(
                "Gabinet Standard",
                "ROOM-STD",
                new Money(2200m),
                areaSquareMeters: 16m,
                capacity: 2,
                description: "Compact private office for focused work.")
        };

        var parking = new ParkingSpace(
            "Miejsce Parkingowe P1",
            "PARK-P1",
            "P1",
            new Money(8m),
            level: "Underground -1",
            description: "Covered parking spot next to the main entrance.");

        context.Tenants.AddRange(tenants);
        context.Spaces.AddRange(desks);
        context.Spaces.AddRange(rooms);
        context.Spaces.Add(parking);

        context.SaveChanges();
    }
}
