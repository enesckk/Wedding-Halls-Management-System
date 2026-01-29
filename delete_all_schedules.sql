-- Tüm schedule'ları silmek için SQL script
-- DİKKAT: Bu işlem geri alınamaz!

-- Tüm schedule'ları sil
DELETE FROM "Schedules";

-- Silinen kayıt sayısını kontrol et
SELECT COUNT(*) FROM "Schedules";

-- Eğer sadece belirli bir salonun schedule'larını silmek istiyorsanız:
-- DELETE FROM "Schedules" WHERE "WeddingHallId" = 'SALON_ID_BURAYA';

-- Eğer sadece belirli bir tarihten önceki schedule'ları silmek istiyorsanız:
-- DELETE FROM "Schedules" WHERE "Date" < '2026-01-01';

-- Eğer sadece belirli bir etkinlik tipini silmek istiyorsanız:
-- DELETE FROM "Schedules" WHERE "EventType" = 0; -- 0 = Nikah, 1 = Nişan, 2 = Konser, 3 = Toplantı, 4 = Özel
