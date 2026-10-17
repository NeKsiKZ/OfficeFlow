using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSpaceFloorNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FloorNumber",
                table: "Spaces",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Spaces_FloorNumber",
                table: "Spaces",
                column: "FloorNumber");

            // Desks (1) + Rooms (2) → floor 1; Parking (3) stays on ground floor 0.
            migrationBuilder.Sql(
                """
                UPDATE "Spaces"
                SET "FloorNumber" = 1
                WHERE "SpaceType" IN (1, 2);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Spaces_FloorNumber",
                table: "Spaces");

            migrationBuilder.DropColumn(
                name: "FloorNumber",
                table: "Spaces");
        }
    }
}
