-- WeddingHalls tablosuna TechnicalDetails kolonu ekle
ALTER TABLE "WeddingHalls" 
ADD COLUMN IF NOT EXISTS "TechnicalDetails" TEXT NOT NULL DEFAULT '';
