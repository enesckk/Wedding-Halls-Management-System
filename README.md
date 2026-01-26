# NikahSalon API

ASP.NET Core 8 Web API for the Wedding Hall Management System. Clean Architecture, PostgreSQL, JWT, ASP.NET Identity.

📦 **For production deployment on Plesk, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## Requirements

- .NET 9 SDK (or .NET 8)
- PostgreSQL 12+

**Note:** If you see `role "postgres" does not exist`, use your actual PostgreSQL username in the connection string (e.g. your macOS user, or create a `postgres` role).

## Setup

1. Create a PostgreSQL database, e.g. `nikahsalon`.
2. Update `src/NikahSalon.API/appsettings.json` (or `appsettings.Development.json`) with your connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=postgres;Password=YOUR_PASSWORD"
}
```

3. Update JWT `SecretKey` in appsettings (use a strong secret in production).

## Run

```bash
cd wedding-hall-api
dotnet run --project src/NikahSalon.API
```

API runs at `https://localhost:7xxx` (see launchSettings.json).

## Seed users

- **Viewer:** `viewer@nikahsalon.local` / `Viewer1!`
- **Editor:** `editor@nikahsalon.local` / `Editor1!`

## Endpoints (all under `/api/v1`)

| Method | Endpoint | Roles |
|--------|----------|-------|
| POST | `/api/v1/auth/login` | Anonymous |
| GET | `/api/v1/auth/me` | Viewer, Editor |
| GET | `/api/v1/halls` | Viewer, Editor |
| GET | `/api/v1/halls/{id}` | Viewer, Editor |
| GET | `/api/v1/halls/{id}/schedules` | Viewer, Editor |
| POST | `/api/v1/halls` | Editor |
| PUT | `/api/v1/halls/{id}` | Editor |
| PUT | `/api/v1/schedules/{id}` | Editor |
| POST | `/api/v1/requests` | Viewer |
| GET | `/api/v1/requests` | Editor |
| PUT | `/api/v1/requests/{id}/answer` | Editor |
| POST | `/api/v1/requests/{id}/messages` | Viewer, Editor |
| GET | `/api/v1/requests/{id}/messages` | Viewer, Editor |

## Database Setup (Migrations)

The project uses EF Core Migrations. **EnsureCreated is removed.**

### First-time setup:

1. **Install dotnet-ef tool** (if not already installed):
   ```bash
   dotnet tool install --global dotnet-ef
   ```

2. **Create initial migration:**
   ```bash
   cd wedding-hall-api
   dotnet ef migrations add InitialCreate --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
   ```

3. **Apply migration to database:**
   ```bash
   dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
   ```

This creates all tables:
- **Identity tables** (AspNetUsers, AspNetRoles, AspNetUserRoles, etc.)
- **Domain tables** (WeddingHalls, Schedules, Requests, Messages)

### Seed Data

Seed data (roles, demo users, sample halls) runs automatically on app startup via `SeedData.SeedAsync()` in `Program.cs`.

### Adding new migrations

After entity changes:
```bash
dotnet ef migrations add MigrationName --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
```
