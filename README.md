# NikahSalon API

ASP.NET Core 8 Web API for the Wedding Hall Management System. Clean Architecture, **PostgreSQL veya SQL Server**, JWT, ASP.NET Identity.

📦 **For production deployment on Plesk, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## Requirements

- .NET 9 SDK (or .NET 8)
- **PostgreSQL 12+** (varsayılan) veya **SQL Server** (LocalDB / Express / Azure SQL)

**Note:** If you see `role "postgres" does not exist`, use your actual PostgreSQL username in the connection string (e.g. your macOS user, or create a `postgres` role).

## Setup

Varsayılan veritabanı **PostgreSQL**'dir. SQL Server kullanmak için `DatabaseProvider` ve connection string'i değiştirin.

### PostgreSQL (varsayılan)

1. PostgreSQL'de veritabanı oluşturun, örn. `nikahsalon`.
2. `src/NikahSalon.API/appsettings.json` (veya `appsettings.Development.json`) içinde:

```json
"DatabaseProvider": "Postgres",
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=postgres;Password=YOUR_PASSWORD"
}
```

### SQL Server

1. SQL Server'da veritabanı oluşturun, örn. `nikahsalon`.
2. `src/NikahSalon.API/appsettings.json` (veya `appsettings.Development.json`) içinde:

```json
"DatabaseProvider": "SqlServer",
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=nikahsalon;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=true;"
}
```

3. Migration'ları SQL Server için uygularken ortam değişkeni verin (EF araçları config okuyorsa gerek kalmaz):

```bash
set DatabaseProvider=SqlServer
dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
```

(Linux/macOS: `export DatabaseProvider=SqlServer`)

4. JWT `SecretKey` değerini appsettings içinde güncelleyin (production'da güçlü bir secret kullanın).

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

Proje EF Core Migrations kullanır. **EnsureCreated kaldırıldı.**

### İlk kurulum

1. **dotnet-ef aracını yükleyin** (yoksa):
   ```bash
   dotnet tool install --global dotnet-ef
   ```

2. **Migration'ları veritabanına uygulayın:**
   - **PostgreSQL (varsayılan):** `DatabaseProvider` ayarlamayın veya `"Postgres"` bırakın.
   ```bash
   cd src/NikahSalon.API
   dotnet ef database update --project ../NikahSalon.Infrastructure --startup-project .
   ```
   - **SQL Server:** appsettings'te `"DatabaseProvider": "SqlServer"` ve SQL Server connection string kullanın. Aynı komutu çalıştırın; DesignTimeDbContextFactory appsettings'ten provider'ı okur.

3. (İsteğe bağlı) SQL Server ile migration çalıştırırken ortam değişkeni:
   ```bash
   set DatabaseProvider=SqlServer
   dotnet ef database update --project ../NikahSalon.Infrastructure --startup-project .
   ```

Bu işlem tüm tabloları oluşturur:
- **Identity tabloları** (AspNetUsers, AspNetRoles, AspNetUserRoles, vb.)
- **Domain tabloları** (Centers, WeddingHalls, HallAccesses, Schedules, Requests, Messages)

### Seed Data

Seed data (roles, demo users, sample halls) runs automatically on app startup via `SeedData.SeedAsync()` in `Program.cs`.

### Adding new migrations

After entity changes:
```bash
dotnet ef migrations add MigrationName --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
```
