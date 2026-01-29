using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NikahSalon.Infrastructure.Migrations
{
    [Migration("20260127120000_InitialCreate")]
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var isSqlServer = string.Equals(Environment.GetEnvironmentVariable("DatabaseProvider"), "SqlServer", StringComparison.OrdinalIgnoreCase);
            var guidType = isSqlServer ? "uniqueidentifier" : "uuid";
            var intType = isSqlServer ? "int" : "integer";
            var longTextType = isSqlServer ? "nvarchar(max)" : "text";
            var varChar256 = isSqlServer ? "nvarchar(256)" : "character varying(256)";
            var varChar200 = isSqlServer ? "nvarchar(200)" : "character varying(200)";
            var varChar2000 = isSqlServer ? "nvarchar(2000)" : "character varying(2000)";
            var varChar500 = isSqlServer ? "nvarchar(500)" : "character varying(500)";
            var varChar5000 = isSqlServer ? "nvarchar(5000)" : "character varying(5000)";
            var dateTimeType = isSqlServer ? "datetimeoffset" : "timestamp with time zone";
            var dateType = isSqlServer ? "date" : "date";
            var timeType = isSqlServer ? "time" : "time without time zone";
            var boolType = isSqlServer ? "bit" : "boolean";

            // AspNetRoles
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    Name = table.Column<string>(type: varChar256, maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: varChar256, maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: longTextType, nullable: true)
                },
                constraints: table => table.PrimaryKey("PK_AspNetRoles", x => x.Id));

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            // AspNetUsers (without Department, Phone - added in later migrations)
            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    UserName = table.Column<string>(type: varChar256, maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: varChar256, maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: varChar256, maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: varChar256, maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: boolType, nullable: false),
                    PasswordHash = table.Column<string>(type: longTextType, nullable: true),
                    SecurityStamp = table.Column<string>(type: longTextType, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: longTextType, nullable: true),
                    PhoneNumber = table.Column<string>(type: longTextType, nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: boolType, nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: boolType, nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: dateTimeType, nullable: true),
                    LockoutEnabled = table.Column<bool>(type: boolType, nullable: false),
                    AccessFailedCount = table.Column<int>(type: intType, nullable: false),
                    FullName = table.Column<string>(type: longTextType, nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_AspNetUsers", x => x.Id));

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");
            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            // AspNetUserRoles
            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: guidType, nullable: false),
                    RoleId = table.Column<Guid>(type: guidType, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            // AspNetUserClaims (Id: identity on SQL Server, serial on Postgres via type)
            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: intType, nullable: false),
                    UserId = table.Column<Guid>(type: guidType, nullable: false),
                    ClaimType = table.Column<string>(type: longTextType, nullable: true),
                    ClaimValue = table.Column<string>(type: longTextType, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            // AspNetUserLogins
            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: longTextType, nullable: false),
                    ProviderKey = table.Column<string>(type: longTextType, nullable: false),
                    ProviderDisplayName = table.Column<string>(type: longTextType, nullable: true),
                    UserId = table.Column<Guid>(type: guidType, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            // AspNetUserTokens
            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: guidType, nullable: false),
                    LoginProvider = table.Column<string>(type: longTextType, nullable: false),
                    Name = table.Column<string>(type: longTextType, nullable: false),
                    Value = table.Column<string>(type: longTextType, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // AspNetRoleClaims (Id: identity on SQL Server, serial on Postgres via type)
            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: intType, nullable: false),
                    RoleId = table.Column<Guid>(type: guidType, nullable: false),
                    ClaimType = table.Column<string>(type: longTextType, nullable: true),
                    ClaimValue = table.Column<string>(type: longTextType, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            // WeddingHalls (without CenterId - added in AddCentersAndHallAccess)
            migrationBuilder.CreateTable(
                name: "WeddingHalls",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    Name = table.Column<string>(type: varChar200, maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: varChar500, maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: varChar2000, maxLength: 2000, nullable: false),
                    ImageUrl = table.Column<string>(type: longTextType, nullable: false),
                    Capacity = table.Column<int>(type: intType, nullable: false),
                    TechnicalDetails = table.Column<string>(type: varChar5000, maxLength: 5000, nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_WeddingHalls", x => x.Id));

            // Schedules (without CreatedByUserId, EventType, EventName, EventOwner - added in later migrations)
            migrationBuilder.CreateTable(
                name: "Schedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    WeddingHallId = table.Column<Guid>(type: guidType, nullable: false),
                    Date = table.Column<DateOnly>(type: dateType, nullable: false),
                    StartTime = table.Column<TimeOnly>(type: timeType, nullable: false),
                    EndTime = table.Column<TimeOnly>(type: timeType, nullable: false),
                    Status = table.Column<int>(type: intType, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Schedules_WeddingHalls_WeddingHallId",
                        column: x => x.WeddingHallId,
                        principalTable: "WeddingHalls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            migrationBuilder.CreateIndex(
                name: "IX_Schedules_WeddingHallId_Date",
                table: "Schedules",
                columns: new[] { "WeddingHallId", "Date" });

            // Requests
            migrationBuilder.CreateTable(
                name: "Requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    Message = table.Column<string>(type: varChar2000, maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: dateTimeType, nullable: false),
                    Status = table.Column<int>(type: intType, nullable: false),
                    WeddingHallId = table.Column<Guid>(type: guidType, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: guidType, nullable: false),
                    EventDate = table.Column<DateOnly>(type: dateType, nullable: false),
                    EventTime = table.Column<TimeOnly>(type: timeType, nullable: false),
                    EventType = table.Column<int>(type: intType, nullable: false),
                    EventName = table.Column<string>(type: varChar200, maxLength: 200, nullable: false),
                    EventOwner = table.Column<string>(type: varChar200, maxLength: 200, nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_Requests", x => x.Id));

            // Messages
            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    Content = table.Column<string>(type: varChar2000, maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: dateTimeType, nullable: false),
                    RequestId = table.Column<Guid>(type: guidType, nullable: false),
                    SenderUserId = table.Column<Guid>(type: guidType, nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_Messages", x => x.Id));
            migrationBuilder.CreateIndex(
                name: "IX_Messages_RequestId",
                table: "Messages",
                column: "RequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "AspNetRoleClaims");
            migrationBuilder.DropTable(name: "AspNetUserClaims");
            migrationBuilder.DropTable(name: "AspNetUserLogins");
            migrationBuilder.DropTable(name: "AspNetUserRoles");
            migrationBuilder.DropTable(name: "AspNetUserTokens");
            migrationBuilder.DropTable(name: "Messages");
            migrationBuilder.DropTable(name: "Requests");
            migrationBuilder.DropTable(name: "Schedules");
            migrationBuilder.DropTable(name: "WeddingHalls");
            migrationBuilder.DropTable(name: "AspNetRoles");
            migrationBuilder.DropTable(name: "AspNetUsers");
        }
    }
}
