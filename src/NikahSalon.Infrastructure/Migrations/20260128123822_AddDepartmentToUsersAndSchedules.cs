using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NikahSalon.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentToUsersAndSchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var isSqlServer = string.Equals(Environment.GetEnvironmentVariable("DatabaseProvider"), "SqlServer", StringComparison.OrdinalIgnoreCase);
            var intType = isSqlServer ? "int" : "integer";
            var guidType = isSqlServer ? "uniqueidentifier" : "uuid";

            // SQL Server'da bazen bu migration ilk uygulanan oluyor; temel tablolar yoksa once onlari olustur
            if (isSqlServer)
            {
                migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUsers')
BEGIN
    CREATE TABLE [AspNetRoles] ([Id] uniqueidentifier NOT NULL, [Name] nvarchar(256), [NormalizedName] nvarchar(256), [ConcurrencyStamp] nvarchar(max), CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id]));
    CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
    CREATE TABLE [AspNetUsers] ([Id] uniqueidentifier NOT NULL, [UserName] nvarchar(256), [NormalizedUserName] nvarchar(256), [Email] nvarchar(256), [NormalizedEmail] nvarchar(256), [EmailConfirmed] bit NOT NULL, [PasswordHash] nvarchar(max), [SecurityStamp] nvarchar(max), [ConcurrencyStamp] nvarchar(max), [PhoneNumber] nvarchar(max), [PhoneNumberConfirmed] bit NOT NULL, [TwoFactorEnabled] bit NOT NULL, [LockoutEnd] datetimeoffset, [LockoutEnabled] bit NOT NULL, [AccessFailedCount] int NOT NULL, [FullName] nvarchar(max) NOT NULL, CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id]));
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
    CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
    CREATE TABLE [AspNetUserRoles] ([UserId] uniqueidentifier NOT NULL, [RoleId] uniqueidentifier NOT NULL, CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]), CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE, CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE);
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
    CREATE TABLE [AspNetUserClaims] ([Id] int IDENTITY(1,1) NOT NULL, [UserId] uniqueidentifier NOT NULL, [ClaimType] nvarchar(max), [ClaimValue] nvarchar(max), CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]), CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE);
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
    CREATE TABLE [AspNetUserLogins] ([LoginProvider] nvarchar(450) NOT NULL, [ProviderKey] nvarchar(450) NOT NULL, [ProviderDisplayName] nvarchar(max), [UserId] uniqueidentifier NOT NULL, CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]), CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE);
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
    CREATE TABLE [AspNetUserTokens] ([UserId] uniqueidentifier NOT NULL, [LoginProvider] nvarchar(450) NOT NULL, [Name] nvarchar(450) NOT NULL, [Value] nvarchar(max), CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]), CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE);
    CREATE TABLE [AspNetRoleClaims] ([Id] int IDENTITY(1,1) NOT NULL, [RoleId] uniqueidentifier NOT NULL, [ClaimType] nvarchar(max), [ClaimValue] nvarchar(max), CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]), CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE);
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
    CREATE TABLE [WeddingHalls] ([Id] uniqueidentifier NOT NULL, [Name] nvarchar(200) NOT NULL, [Address] nvarchar(500) NOT NULL, [Description] nvarchar(2000) NOT NULL, [ImageUrl] nvarchar(max) NOT NULL, [Capacity] int NOT NULL, [TechnicalDetails] nvarchar(max) NOT NULL, CONSTRAINT [PK_WeddingHalls] PRIMARY KEY ([Id]));
    CREATE TABLE [Schedules] ([Id] uniqueidentifier NOT NULL, [WeddingHallId] uniqueidentifier NOT NULL, [Date] date NOT NULL, [StartTime] time NOT NULL, [EndTime] time NOT NULL, [Status] int NOT NULL, CONSTRAINT [PK_Schedules] PRIMARY KEY ([Id]), CONSTRAINT [FK_Schedules_WeddingHalls_WeddingHallId] FOREIGN KEY ([WeddingHallId]) REFERENCES [WeddingHalls] ([Id]) ON DELETE CASCADE);
    CREATE INDEX [IX_Schedules_WeddingHallId_Date] ON [Schedules] ([WeddingHallId], [Date]);
    CREATE TABLE [Requests] ([Id] uniqueidentifier NOT NULL, [Message] nvarchar(2000) NOT NULL, [CreatedAt] datetimeoffset NOT NULL, [Status] int NOT NULL, [WeddingHallId] uniqueidentifier NOT NULL, [CreatedByUserId] uniqueidentifier NOT NULL, [EventDate] date NOT NULL, [EventTime] time NOT NULL, [EventType] int NOT NULL, [EventName] nvarchar(200) NOT NULL, [EventOwner] nvarchar(200) NOT NULL, CONSTRAINT [PK_Requests] PRIMARY KEY ([Id]));
    CREATE TABLE [Messages] ([Id] uniqueidentifier NOT NULL, [Content] nvarchar(2000) NOT NULL, [CreatedAt] datetimeoffset NOT NULL, [RequestId] uniqueidentifier NOT NULL, [SenderUserId] uniqueidentifier NOT NULL, CONSTRAINT [PK_Messages] PRIMARY KEY ([Id]));
    CREATE INDEX [IX_Messages_RequestId] ON [Messages] ([RequestId]);
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260127120000_InitialCreate', '8.0.11');
END
");
            }

            migrationBuilder.AddColumn<int>(
                name: "Department",
                table: "AspNetUsers",
                type: intType,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Schedules",
                type: guidType,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EventType",
                table: "Schedules",
                type: intType,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_CreatedByUserId",
                table: "Schedules",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_EventType",
                table: "Schedules",
                column: "EventType");
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
