using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicableSpaceTypesToAdditionalServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Default existing rows to Desk + Room + Parking so nothing breaks mid-upgrade.
            migrationBuilder.AddColumn<int[]>(
                name: "ApplicableSpaceTypes",
                table: "AdditionalServices",
                type: "integer[]",
                nullable: false,
                defaultValue: new[] { 1, 2, 3 });

            // Tighten known demo services (media/locker/parking add-on ≠ parking space).
            migrationBuilder.Sql(
                """
                UPDATE "AdditionalServices"
                SET "ApplicableSpaceTypes" = ARRAY[1, 2]::integer[]
                WHERE "Name" IN ('Parking podziemny', 'Szafka', 'Pakiet mediów');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicableSpaceTypes",
                table: "AdditionalServices");
        }
    }
}
