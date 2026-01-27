# PostgreSQL veritabanına TechnicalDetails kolonu ekle
# Docker kullanıyorsanız:
docker exec -it sehitkamil_db psql -U enescikcik -d nikahsalon -c "ALTER TABLE \"WeddingHalls\" ADD COLUMN IF NOT EXISTS \"TechnicalDetails\" TEXT NOT NULL DEFAULT '';"

# Veya doğrudan PostgreSQL'e bağlanıyorsanız:
# psql -U enescikcik -d nikahsalon -c "ALTER TABLE \"WeddingHalls\" ADD COLUMN IF NOT EXISTS \"TechnicalDetails\" TEXT NOT NULL DEFAULT '';"

Write-Host "TechnicalDetails kolonu eklendi (veya zaten mevcut)."
