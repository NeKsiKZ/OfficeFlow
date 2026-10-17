using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAdditionalServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdditionalServices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdditionalServices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReservationAdditionalServices",
                columns: table => new
                {
                    AdditionalServicesId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReservationsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservationAdditionalServices", x => new { x.AdditionalServicesId, x.ReservationsId });
                    table.ForeignKey(
                        name: "FK_ReservationAdditionalServices_AdditionalServices_Additional~",
                        column: x => x.AdditionalServicesId,
                        principalTable: "AdditionalServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReservationAdditionalServices_Reservations_ReservationsId",
                        column: x => x.ReservationsId,
                        principalTable: "Reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdditionalServices_Name",
                table: "AdditionalServices",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_ReservationAdditionalServices_ReservationsId",
                table: "ReservationAdditionalServices",
                column: "ReservationsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReservationAdditionalServices");

            migrationBuilder.DropTable(
                name: "AdditionalServices");
        }
    }
}
