-- Migration: AddCentersAndHallAccess
-- Bu migration'ı manuel olarak çalıştırın
-- Tüm komutları tek bir transaction içinde çalıştırın

BEGIN;

-- 1. Centers tablosunu oluştur (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Centers') THEN
        CREATE TABLE "Centers" (
            "Id" uuid NOT NULL,
            "Name" character varying(200) NOT NULL,
            "Address" character varying(500) NOT NULL,
            "Description" character varying(2000) NOT NULL,
            "ImageUrl" text NOT NULL,
            "CreatedAt" timestamp with time zone NOT NULL,
            CONSTRAINT "PK_Centers" PRIMARY KEY ("Id")
        );
    END IF;
END $$;

-- 2. WeddingHalls tablosuna CenterId kolonunu ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'WeddingHalls' AND column_name = 'CenterId'
    ) THEN
        ALTER TABLE "WeddingHalls" ADD COLUMN "CenterId" uuid NULL;
    END IF;
END $$;

-- 3. Mevcut WeddingHall kayıtları için varsayılan bir Center oluştur ve kayıtları bağla
INSERT INTO "Centers" ("Id", "Name", "Address", "Description", "ImageUrl", "CreatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Varsayılan Merkez', 'Adres belirtilmemiş', 'Mevcut salonlar için oluşturulan varsayılan merkez', '', NOW())
ON CONFLICT ("Id") DO NOTHING;

UPDATE "WeddingHalls"
SET "CenterId" = '00000000-0000-0000-0000-000000000001'
WHERE "CenterId" IS NULL;

-- 4. CenterId'yi zorunlu yap (eğer hala nullable ise)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'WeddingHalls' 
        AND column_name = 'CenterId' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "WeddingHalls" ALTER COLUMN "CenterId" SET NOT NULL;
        ALTER TABLE "WeddingHalls" ALTER COLUMN "CenterId" SET DEFAULT '00000000-0000-0000-0000-000000000001';
    END IF;
END $$;

-- 5. Index oluştur (eğer yoksa)
CREATE INDEX IF NOT EXISTS "IX_WeddingHalls_CenterId" ON "WeddingHalls" ("CenterId");

-- 6. Foreign key constraint ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_WeddingHalls_Centers_CenterId'
    ) THEN
        ALTER TABLE "WeddingHalls" 
        ADD CONSTRAINT "FK_WeddingHalls_Centers_CenterId" 
        FOREIGN KEY ("CenterId") 
        REFERENCES "Centers" ("Id") 
        ON DELETE RESTRICT;
    END IF;
END $$;

-- 7. HallAccesses tablosunu oluştur (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'HallAccesses') THEN
        CREATE TABLE "HallAccesses" (
            "Id" uuid NOT NULL,
            "HallId" uuid NOT NULL,
            "UserId" uuid NOT NULL,
            "CreatedAt" timestamp with time zone NOT NULL,
            CONSTRAINT "PK_HallAccesses" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_HallAccesses_WeddingHalls_HallId" FOREIGN KEY ("HallId") REFERENCES "WeddingHalls" ("Id") ON DELETE CASCADE
        );
    END IF;
END $$;

-- 8. Unique index oluştur (eğer yoksa)
CREATE UNIQUE INDEX IF NOT EXISTS "IX_HallAccesses_HallId_UserId" ON "HallAccesses" ("HallId", "UserId");

-- 9. Migration'ı EF Core migration history'ye ekle (eğer yoksa)
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260129000000_AddCentersAndHallAccess', '8.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;

COMMIT;
