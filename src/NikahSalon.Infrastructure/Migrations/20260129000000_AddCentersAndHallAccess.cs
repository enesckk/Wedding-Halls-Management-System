using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace NikahSalon.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCentersAndHallAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var isSqlServer = string.Equals(Environment.GetEnvironmentVariable("DatabaseProvider"), "SqlServer", StringComparison.OrdinalIgnoreCase);
            var guidType = isSqlServer ? "uniqueidentifier" : "uuid";
            var nameType = isSqlServer ? "nvarchar(200)" : "character varying(200)";
            var addressType = isSqlServer ? "nvarchar(500)" : "character varying(500)";
            var descType = isSqlServer ? "nvarchar(2000)" : "character varying(2000)";
            var imageUrlType = isSqlServer ? "nvarchar(max)" : "text";
            var dateTimeType = isSqlServer ? "datetimeoffset" : "timestamp with time zone";

            // 1. Centers tablosunu oluştur
            migrationBuilder.CreateTable(
                name: "Centers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    Name = table.Column<string>(type: nameType, maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: addressType, maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: descType, maxLength: 2000, nullable: false),
                    ImageUrl = table.Column<string>(type: imageUrlType, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: dateTimeType, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Centers", x => x.Id);
                });

            // 2. WeddingHalls tablosuna CenterId kolonunu ekle (nullable önce)
            migrationBuilder.AddColumn<Guid>(
                name: "CenterId",
                table: "WeddingHalls",
                type: guidType,
                nullable: true);

            // 3. Mevcut WeddingHall kayıtları için varsayılan bir Center oluştur ve kayıtları bağla
            var defaultCenterId = new Guid("00000000-0000-0000-0000-000000000001");

            if (isSqlServer)
            {
                migrationBuilder.Sql($@"
                    IF NOT EXISTS (SELECT 1 FROM [Centers] WHERE [Id] = '{defaultCenterId}')
                    INSERT INTO [Centers] ([Id], [Name], [Address], [Description], [ImageUrl], [CreatedAt])
                    VALUES ('{defaultCenterId}', N'Varsayılan Merkez', N'Adres belirtilmemiş', N'Mevcut salonlar için oluşturulan varsayılan merkez', N'', GETUTCDATE());
                    UPDATE [WeddingHalls] SET [CenterId] = '{defaultCenterId}' WHERE [CenterId] IS NULL;
                ");
            }
            else
            {
                migrationBuilder.Sql($@"
                    INSERT INTO ""Centers"" (""Id"", ""Name"", ""Address"", ""Description"", ""ImageUrl"", ""CreatedAt"")
                    VALUES ('{defaultCenterId}', 'Varsayılan Merkez', 'Adres belirtilmemiş', 'Mevcut salonlar için oluşturulan varsayılan merkez', '', NOW())
                    ON CONFLICT DO NOTHING;
                    UPDATE ""WeddingHalls"" SET ""CenterId"" = '{defaultCenterId}' WHERE ""CenterId"" IS NULL;
                ");
            }

            // 4. CenterId'yi zorunlu yap
            migrationBuilder.AlterColumn<Guid>(
                name: "CenterId",
                table: "WeddingHalls",
                type: guidType,
                nullable: false,
                defaultValue: defaultCenterId);

            // 6. Foreign key constraint ekle
            migrationBuilder.CreateIndex(
                name: "IX_WeddingHalls_CenterId",
                table: "WeddingHalls",
                column: "CenterId");

            migrationBuilder.AddForeignKey(
                name: "FK_WeddingHalls_Centers_CenterId",
                table: "WeddingHalls",
                column: "CenterId",
                principalTable: "Centers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 7. HallAccesses tablosunu oluştur
            migrationBuilder.CreateTable(
                name: "HallAccesses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    HallId = table.Column<Guid>(type: guidType, nullable: false),
                    UserId = table.Column<Guid>(type: guidType, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: dateTimeType, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HallAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HallAccesses_WeddingHalls_HallId",
                        column: x => x.HallId,
                        principalTable: "WeddingHalls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HallAccesses_HallId_UserId",
                table: "HallAccesses",
                columns: new[] { "HallId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HallAccesses");

            migrationBuilder.DropForeignKey(
                name: "FK_WeddingHalls_Centers_CenterId",
                table: "WeddingHalls");

            migrationBuilder.DropIndex(
                name: "IX_WeddingHalls_CenterId",
                table: "WeddingHalls");

            migrationBuilder.DropColumn(
                name: "CenterId",
                table: "WeddingHalls");

            migrationBuilder.DropTable(
                name: "Centers");
        }
    }
}
