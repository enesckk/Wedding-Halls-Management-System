using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NikahSalon.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentToUsersAndSchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add Department column to AspNetUsers table (if not exists)
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'AspNetUsers' AND column_name = 'Department'
                    ) THEN
                        ALTER TABLE ""AspNetUsers"" ADD COLUMN ""Department"" integer NULL;
                    END IF;
                END $$;
            ");

            // Add CreatedByUserId column to Schedules table (if not exists)
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'Schedules' AND column_name = 'CreatedByUserId'
                    ) THEN
                        ALTER TABLE ""Schedules"" ADD COLUMN ""CreatedByUserId"" uuid NULL;
                    END IF;
                END $$;
            ");

            // Add EventType column to Schedules table (if not exists)
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'Schedules' AND column_name = 'EventType'
                    ) THEN
                        ALTER TABLE ""Schedules"" ADD COLUMN ""EventType"" integer NULL;
                    END IF;
                END $$;
            ");

            // Create index on CreatedByUserId (if not exists)
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_Schedules_CreatedByUserId"" 
                ON ""Schedules"" (""CreatedByUserId"");
            ");

            // Create index on EventType (if not exists)
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_Schedules_EventType"" 
                ON ""Schedules"" (""EventType"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop indexes
            migrationBuilder.DropIndex(
                name: "IX_Schedules_EventType",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_CreatedByUserId",
                table: "Schedules");

            // Drop columns
            migrationBuilder.DropColumn(
                name: "EventType",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "AspNetUsers");
        }
    }
}
