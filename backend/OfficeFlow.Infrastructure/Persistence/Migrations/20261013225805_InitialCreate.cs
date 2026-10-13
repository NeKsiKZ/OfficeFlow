using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Spaces",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SpaceType = table.Column<int>(type: "integer", nullable: false),
                    HourlyRateAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    HourlyRateCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Floor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Zone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SpotNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ParkingHourlyRateAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ParkingHourlyRateCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MonthlySubscriptionRateAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MonthlySubscriptionRateCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    AreaSquareMeters = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Capacity = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spaces", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpaceType = table.Column<int>(type: "integer", nullable: false),
                    PeriodStartUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodEndUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalCostAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reservations_Spaces_SpaceId",
                        column: x => x.SpaceId,
                        principalTable: "Spaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reservations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_SpaceId",
                table: "Reservations",
                column: "SpaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_SpaceId_Status",
                table: "Reservations",
                columns: new[] { "SpaceId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_TenantId",
                table: "Reservations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Spaces_Code",
                table: "Spaces",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Spaces_SpotNumber",
                table: "Spaces",
                column: "SpotNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Email",
                table: "Tenants",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reservations");

            migrationBuilder.DropTable(
                name: "Spaces");

            migrationBuilder.DropTable(
                name: "Tenants");
        }
    }
}
