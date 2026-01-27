# TechnicalDetails Column Fix

## Problem
The backend is trying to query `TechnicalDetails` column from the `WeddingHalls` table, but this column doesn't exist in the database, causing a 500 error.

## Solution

### Step 1: DbContext Updated ✓
The `AppDbContext.cs` has been updated to include `TechnicalDetails` property configuration.

### Step 2: Add Column to Database

You need to add the `TechnicalDetails` column to your PostgreSQL database. Choose one of the following methods:

#### Option A: Using Docker (if your database is in Docker)
```powershell
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon -c "ALTER TABLE \"WeddingHalls\" ADD COLUMN IF NOT EXISTS \"TechnicalDetails\" TEXT NOT NULL DEFAULT '';"
```

#### Option B: Using psql directly
```powershell
psql -U enescikcik -d nikahsalon -h localhost -p 5432 -c "ALTER TABLE \"WeddingHalls\" ADD COLUMN IF NOT EXISTS \"TechnicalDetails\" TEXT NOT NULL DEFAULT '';"
```

#### Option C: Using pgAdmin or any PostgreSQL client
Run this SQL:
```sql
ALTER TABLE "WeddingHalls" 
ADD COLUMN IF NOT EXISTS "TechnicalDetails" TEXT NOT NULL DEFAULT '';
```

### Step 3: Verify
After adding the column, restart your backend API and test the `/api/v1/halls` endpoint. The error should be resolved.

## Files Changed
- `src/NikahSalon.Infrastructure/Data/AppDbContext.cs` - Added TechnicalDetails property configuration
