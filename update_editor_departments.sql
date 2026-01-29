-- Editor kullanıcılarına Department atama
-- Bu SQL komutlarını PostgreSQL'de çalıştırın

-- Demo Editor (Nikah alanı)
UPDATE "AspNetUsers" 
SET "Department" = 0 
WHERE "Email" = 'editor@nikahsalon.local' AND "Department" IS NULL;

-- Enes Editor (Nişan alanı)
UPDATE "AspNetUsers" 
SET "Department" = 1 
WHERE "Email" = 'enes@gmail.com' AND "Department" IS NULL;

-- Konser Editor
UPDATE "AspNetUsers" 
SET "Department" = 2 
WHERE "Email" = 'konser@nikahsalon.local' AND "Department" IS NULL;

-- Toplantı Editor
UPDATE "AspNetUsers" 
SET "Department" = 3 
WHERE "Email" = 'toplanti@nikahsalon.local' AND "Department" IS NULL;

-- Özel Etkinlik Editor
UPDATE "AspNetUsers" 
SET "Department" = 4 
WHERE "Email" = 'ozel@nikahsalon.local' AND "Department" IS NULL;

-- Kontrol: Editor kullanıcılarının department'larını göster
SELECT "Email", "FullName", "Department" 
FROM "AspNetUsers" 
WHERE "Email" IN (
    'editor@nikahsalon.local',
    'enes@gmail.com',
    'konser@nikahsalon.local',
    'toplanti@nikahsalon.local',
    'ozel@nikahsalon.local'
);
