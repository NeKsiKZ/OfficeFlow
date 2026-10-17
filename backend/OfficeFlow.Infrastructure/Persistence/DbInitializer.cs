using OfficeFlow.Domain.Entities;
using OfficeFlow.Domain.Enums;
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
        SeedTenantsAndSpaces(context);
        SeedAdditionalServices(context);
    }

    private static void SeedTenantsAndSpaces(ApplicationDbContext context)
    {
        if (!context.Spaces.Any() && !context.Tenants.Any())
        {
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

            // Campus plan: Building A = 2 rooms, Building B = 5 desks, outside = 4 parking.
            // Floor 1 = indoor campus (rooms + desks). Floor 0 = outdoor parking.
            var desks = new[]
            {
                new Desk("Biurko A1", "DESK-A1", new Money(25m), floor: "1", zone: "Open Office", floorNumber: 1),
                new Desk("Biurko A2", "DESK-A2", new Money(25m), floor: "1", zone: "Open Office", floorNumber: 1),
                new Desk("Biurko A3", "DESK-A3", new Money(25m), floor: "1", zone: "Open Office", floorNumber: 1),
                new Desk("Biurko B1", "DESK-B1", new Money(28m), floor: "1", zone: "Open Office", floorNumber: 1),
                new Desk("Biurko B2", "DESK-B2", new Money(28m), floor: "1", zone: "Open Office", floorNumber: 1)
            };

            var rooms = new[]
            {
                new Room(
                    "Gabinet Premium",
                    "ROOM-PREMIUM",
                    new Money(3500m),
                    areaSquareMeters: 28m,
                    capacity: 4,
                    description: "Private cabinet in the cabinets building.",
                    floorNumber: 1),
                new Room(
                    "Gabinet Standard",
                    "ROOM-STD",
                    new Money(2200m),
                    areaSquareMeters: 16m,
                    capacity: 2,
                    description: "Compact private office in the cabinets building.",
                    floorNumber: 1)
            };

            context.Tenants.AddRange(tenants);
            context.Spaces.AddRange(desks);
            context.Spaces.AddRange(rooms);
            context.Spaces.AddRange(CreateOutdoorParkingSpots());
            context.SaveChanges();
            return;
        }

        EnsureOutdoorParkingSpots(context);
    }

    private static ParkingSpace[] CreateOutdoorParkingSpots() =>
    [
        new ParkingSpace(
            "Parking P1",
            "PARK-P1",
            "P1",
            new Money(8m),
            level: "Outdoor",
            description: "Outdoor parking spot next to the campus entrance.",
            floorNumber: 0),
        new ParkingSpace(
            "Parking P2",
            "PARK-P2",
            "P2",
            new Money(8m),
            level: "Outdoor",
            description: "Outdoor parking spot next to the campus entrance.",
            floorNumber: 0),
        new ParkingSpace(
            "Parking P3",
            "PARK-P3",
            "P3",
            new Money(8m),
            level: "Outdoor",
            description: "Outdoor parking spot next to the campus entrance.",
            floorNumber: 0),
        new ParkingSpace(
            "Parking P4",
            "PARK-P4",
            "P4",
            new Money(8m),
            level: "Outdoor",
            description: "Outdoor parking spot next to the campus entrance.",
            floorNumber: 0)
    ];

    private static void EnsureOutdoorParkingSpots(ApplicationDbContext context)
    {
        var existingCodes = context.Spaces
            .OfType<ParkingSpace>()
            .Select(space => space.Code)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missing = CreateOutdoorParkingSpots()
            .Where(spot => !existingCodes.Contains(spot.Code))
            .ToArray();

        if (missing.Length == 0)
        {
            return;
        }

        context.Spaces.AddRange(missing);
        context.SaveChanges();
    }

    private static void SeedAdditionalServices(ApplicationDbContext context)
    {
        if (!context.AdditionalServices.Any())
        {
            context.AdditionalServices.AddRange(
                new AdditionalService(
                    "Parking podziemny",
                    new Money(50m),
                    applicableSpaceTypes: [SpaceType.Desk, SpaceType.Room],
                    description: "Miejsce parkingowe w hali. Przy gabinetach — stawka miesięczna."),
                new AdditionalService(
                    "Szafka",
                    new Money(20m),
                    applicableSpaceTypes: [SpaceType.Desk, SpaceType.Room],
                    description: "Indywidualna szafka. Przy gabinetach — stawka miesięczna."),
                new AdditionalService(
                    "Pakiet mediów",
                    new Money(35m),
                    applicableSpaceTypes: [SpaceType.Desk, SpaceType.Room],
                    description: "Drukarka, skaner i Wi‑Fi premium. Przy gabinetach — stawka miesięczna."),
                new AdditionalService(
                    "Mycie pojazdu",
                    new Money(40m),
                    applicableSpaceTypes: [SpaceType.ParkingSpace],
                    description: "Jednorazowe mycie pojazdu przy rezerwacji parkingu."));

            context.SaveChanges();
            return;
        }

        if (!context.AdditionalServices.Any(service => service.Name == "Mycie pojazdu"))
        {
            context.AdditionalServices.Add(
                new AdditionalService(
                    "Mycie pojazdu",
                    new Money(40m),
                    applicableSpaceTypes: [SpaceType.ParkingSpace],
                    description: "Jednorazowe mycie pojazdu przy rezerwacji parkingu."));
            context.SaveChanges();
        }
    }
}
