using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NikahSalon.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEventNameAndOwnerToSchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EventName",
                table: "Schedules",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventOwner",
                table: "Schedules",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventName",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "EventOwner",
                table: "Schedules");
        }
    }
}
