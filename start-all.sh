#!/bin/bash

# Tüm Sistemi Başlatma Scripti
# Database, Backend ve Frontend'i başlatır

echo "=========================================="
echo "🚀 SİSTEM BAŞLATILIYOR"
echo "=========================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. PostgreSQL Kontrolü
echo "📦 1. PostgreSQL Kontrolü..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL çalışıyor${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL çalışmıyor, başlatılıyor...${NC}"
    # Docker ile başlatmayı dene
    if command -v docker > /dev/null 2>&1; then
        cd "$(dirname "$0")"
        if [ -f "start-postgres-docker.sh" ]; then
            bash start-postgres-docker.sh
        fi
    fi
fi
echo ""

# 2. Backend Kontrolü ve Başlatma
echo "🔧 2. Backend Kontrolü..."
BACKEND_DIR="/Users/enescikcik/Desktop/wedding-hall-api"
BACKEND_URL="http://localhost:5230/api/v1/health"

if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend çalışıyor${NC}"
else
    echo -e "${YELLOW}⚠️  Backend çalışmıyor, başlatılıyor...${NC}"
    cd "$BACKEND_DIR"
    dotnet run --project src/NikahSalon.API > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend başlatıldı (PID: $BACKEND_PID)"
    
    # Backend'in hazır olmasını bekle
    echo "Backend'in hazır olması bekleniyor..."
    for i in {1..30}; do
        if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend hazır!${NC}"
            break
        fi
        sleep 1
    done
fi
echo ""

# 3. Frontend Kontrolü ve Başlatma
echo "🎨 3. Frontend Kontrolü..."
FRONTEND_DIR="/Users/enescikcik/Desktop/wedding-hall-ui"
FRONTEND_URL="http://localhost:3000"

if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>&1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Frontend çalışıyor${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend çalışmıyor, başlatılıyor...${NC}"
    cd "$FRONTEND_DIR"
    npm run dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend başlatıldı (PID: $FRONTEND_PID)"
    
    # Frontend'in hazır olmasını bekle
    echo "Frontend'in hazır olması bekleniyor..."
    for i in {1..60}; do
        if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>&1 | grep -q "200\|301\|302"; then
            echo -e "${GREEN}✅ Frontend hazır!${NC}"
            break
        fi
        sleep 1
    done
fi
echo ""

# 4. Durum Özeti
echo "=========================================="
echo "📊 SİSTEM DURUMU"
echo "=========================================="

# PostgreSQL
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL: Çalışıyor${NC} (localhost:5432)"
else
    echo -e "${RED}❌ PostgreSQL: Çalışmıyor${NC}"
fi

# Backend
if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: Çalışıyor${NC} (http://localhost:5230)"
    echo "   Swagger: http://localhost:5230/swagger"
else
    echo -e "${RED}❌ Backend: Çalışmıyor${NC}"
fi

# Frontend
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>&1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Frontend: Çalışıyor${NC} (http://localhost:3000)"
else
    echo -e "${RED}❌ Frontend: Çalışmıyor${NC}"
fi

echo ""
echo "=========================================="
echo "🎯 TEST İÇİN HAZIR!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5230"
echo "Swagger: http://localhost:5230/swagger"
echo ""
echo "Test Kullanıcıları:"
echo "  Viewer: viewer@nikahsalon.local / Viewer1!"
echo "  Editor: editor@nikahsalon.local / Editor1!"
echo ""
