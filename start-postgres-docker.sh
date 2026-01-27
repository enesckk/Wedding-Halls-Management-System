#!/bin/bash
# PostgreSQL Docker Container Baslatma Scripti (WSL/Linux)

echo "=== PostgreSQL Docker Container ==="
echo ""

# Docker calisiyor mu kontrol et
if ! docker info > /dev/null 2>&1; then
    echo "HATA: Docker calismiyor!"
    echo "Lutfen Docker'i baslatin."
    exit 1
fi

# Container var mı kontrol et
CONTAINER_EXISTS=$(docker ps -a --filter "name=postgres-nikahsalon" --format "{{.Names}}")

if [ "$CONTAINER_EXISTS" = "postgres-nikahsalon" ]; then
    echo "Container bulundu. Durum kontrol ediliyor..."
    
    CONTAINER_RUNNING=$(docker ps --filter "name=postgres-nikahsalon" --format "{{.Names}}")
    
    if [ "$CONTAINER_RUNNING" = "postgres-nikahsalon" ]; then
        echo "Container zaten calisiyor!"
    else
        echo "Container baslatiliyor..."
        docker start postgres-nikahsalon
        if [ $? -eq 0 ]; then
            echo "Container baslatildi!"
        else
            echo "HATA: Container baslatilamadi!"
            exit 1
        fi
    fi
else
    echo "Container bulunamadi. Olusturuluyor..."
    echo "Sifre: 'your_password' olarak ayarlandi. Degistirmek icin scripti duzenleyin."
    
    docker run --name postgres-nikahsalon \
      -e POSTGRES_USER=enescikcik \
      -e POSTGRES_PASSWORD=your_password \
      -e POSTGRES_DB=nikahsalon \
      -p 5432:5432 \
      -v postgres-data:/var/lib/postgresql/data \
      -d postgres:15
    
    if [ $? -eq 0 ]; then
        echo "Container olusturuldu ve baslatildi!"
        echo "Ilk baslatma biraz zaman alabilir..."
        sleep 5
    else
        echo "HATA: Container olusturulamadi!"
        exit 1
    fi
fi

# Durum kontrolu
echo ""
echo "Container durumu:"
docker ps --filter "name=postgres-nikahsalon" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Baglanti testi
echo ""
echo "Baglanti testi yapiliyor..."
sleep 2

if docker exec postgres-nikahsalon pg_isready -U enescikcik > /dev/null 2>&1; then
    echo "PostgreSQL hazir!"
else
    echo "UYARI: PostgreSQL henuz hazir degil. Biraz bekleyin..."
fi

echo ""
echo "=== Tamamlandi ==="
echo "Backend'i calistirabilirsiniz:"
echo "cd /mnt/c/Users/Dell/Documents/PROJECT/Wedding-Halls-Management-System-Backend/src/NikahSalon.API"
echo "dotnet run"
