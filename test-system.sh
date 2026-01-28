#!/bin/bash

# Sistem Detaylı Test Scripti
# Frontend, Backend, Database, Route'lar ve Bağlantıları test eder

echo "=========================================="
echo "🔍 SİSTEM DETAYLI TEST BAŞLATILIYOR"
echo "=========================================="
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test sonuçları
PASSED=0
FAILED=0
WARNINGS=0

# Test fonksiyonu
test_check() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "Testing: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# Warning fonksiyonu
test_warning() {
    local name=$1
    local message=$2
    
    echo -e "${YELLOW}⚠️  WARNING: $name - $message${NC}"
    ((WARNINGS++))
}

echo "📦 1. FRONTEND KONTROLLERİ"
echo "----------------------------------------"

# Frontend dizini kontrolü
test_check "Frontend dizini mevcut" "test -d /Users/enescikcik/Desktop/wedding-hall-ui"

# package.json kontrolü
test_check "package.json mevcut" "test -f /Users/enescikcik/Desktop/wedding-hall-ui/package.json"

# .env.local kontrolü
if test -f /Users/enescikcik/Desktop/wedding-hall-ui/.env.local; then
    test_check ".env.local mevcut" "true"
    
    # NEXT_PUBLIC_API_URL kontrolü
    if grep -q "NEXT_PUBLIC_API_URL" /Users/enescikcik/Desktop/wedding-hall-ui/.env.local; then
        API_URL=$(grep "NEXT_PUBLIC_API_URL" /Users/enescikcik/Desktop/wedding-hall-ui/.env.local | cut -d '=' -f2)
        echo -e "   ${GREEN}✅ NEXT_PUBLIC_API_URL: $API_URL${NC}"
    else
        test_warning ".env.local" "NEXT_PUBLIC_API_URL tanımlı değil"
    fi
else
    test_warning ".env.local" "Dosya mevcut değil"
fi

# getBaseUrl fonksiyonu kontrolü
if grep -q "export const getBaseUrl" /Users/enescikcik/Desktop/wedding-hall-ui/lib/api/base.ts; then
    test_check "getBaseUrl fonksiyonu tanımlı" "true"
else
    test_check "getBaseUrl fonksiyonu tanımlı" "false"
fi

echo ""
echo "🔧 2. BACKEND KONTROLLERİ"
echo "----------------------------------------"

# Backend dizini kontrolü
test_check "Backend dizini mevcut" "test -d /Users/enescikcik/Desktop/wedding-hall-api"

# Program.cs kontrolü
test_check "Program.cs mevcut" "test -f /Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/Program.cs"

# appsettings.json kontrolü
if test -f /Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/appsettings.json; then
    test_check "appsettings.json mevcut" "true"
    
    # Connection string kontrolü
    if grep -q "DefaultConnection" /Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/appsettings.json; then
        CONN_STR=$(grep -A 1 "DefaultConnection" /Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/appsettings.json | tail -1 | sed 's/.*"\(.*\)".*/\1/')
        if echo "$CONN_STR" | grep -q "Password="; then
            PWD_LEN=$(echo "$CONN_STR" | grep -o "Password=[^;]*" | cut -d'=' -f2 | wc -c)
            if [ "$PWD_LEN" -le 1 ]; then
                test_warning "Connection String" "Password boş görünüyor"
            else
                echo -e "   ${GREEN}✅ Connection String mevcut${NC}"
            fi
        fi
    fi
else
    test_warning "appsettings.json" "Dosya mevcut değil"
fi

# launchSettings.json kontrolü
if test -f /Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/Properties/launchSettings.json; then
    test_check "launchSettings.json mevcut" "true"
    
    # Port kontrolü
    PORT=$(grep -o '"applicationUrl": "[^"]*"' /Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/Properties/launchSettings.json | head -1 | grep -o 'localhost:[0-9]*' | cut -d':' -f2)
    if [ ! -z "$PORT" ]; then
        echo -e "   ${GREEN}✅ Backend Port: $PORT${NC}"
    fi
else
    test_warning "launchSettings.json" "Dosya mevcut değil"
fi

# Controllers kontrolü
CONTROLLERS=("AuthController" "HallsController" "SchedulesController" "RequestsController" "DashboardController" "UsersController" "HealthController")
for controller in "${CONTROLLERS[@]}"; do
    if test -f "/Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/Controllers/${controller}.cs"; then
        echo -e "   ${GREEN}✅ $controller mevcut${NC}"
    else
        test_warning "Controller" "$controller bulunamadı"
    fi
done

echo ""
echo "🗄️  3. DATABASE KONTROLLERİ"
echo "----------------------------------------"

# PostgreSQL kontrolü
if command -v psql > /dev/null 2>&1; then
    test_check "PostgreSQL client mevcut" "true"
    
    # PostgreSQL servis kontrolü (macOS)
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        test_check "PostgreSQL servisi çalışıyor" "true"
    else
        test_warning "PostgreSQL" "Servis çalışmıyor veya erişilemiyor"
    fi
else
    test_warning "PostgreSQL" "psql komutu bulunamadı"
fi

# Database bağlantı testi (opsiyonel - şifre gerektirir)
# Bu kısım manuel test gerektirir

echo ""
echo "🌐 4. NETWORK VE BAĞLANTI TESTLERİ"
echo "----------------------------------------"

# Backend port kontrolü
if [ ! -z "$PORT" ]; then
    if command -v curl > /dev/null 2>&1; then
        # Health endpoint testi
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/api/v1/health" | grep -q "200"; then
            test_check "Backend health endpoint" "true"
        else
            test_warning "Backend" "Health endpoint yanıt vermiyor (backend çalışmıyor olabilir)"
        fi
    else
        test_warning "Network Test" "curl komutu bulunamadı"
    fi
fi

# CORS kontrolü (kod seviyesinde)
if grep -q "AddCors" /Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/Program.cs; then
    test_check "CORS yapılandırılmış" "true"
else
    test_check "CORS yapılandırılmış" "false"
fi

echo ""
echo "📋 5. ROUTE KONTROLLERİ"
echo "----------------------------------------"

# API route'ları kontrol et
ROUTES=(
    "api/v1/auth"
    "api/v1/halls"
    "api/v1/schedules"
    "api/v1/requests"
    "api/v1/dashboard"
    "api/v1/users"
    "api/v1/health"
)

for route in "${ROUTES[@]}"; do
    if grep -r "Route(\"$route\")" /Users/enescikcik/Desktop/wedding-hall-api/src/NikahSalon.API/Controllers/ > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Route: /$route${NC}"
    else
        test_warning "Route" "/$route bulunamadı"
    fi
done

echo ""
echo "=========================================="
echo "📊 TEST SONUÇLARI"
echo "=========================================="
echo -e "${GREEN}✅ Başarılı: $PASSED${NC}"
echo -e "${RED}❌ Başarısız: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Uyarılar: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Tüm kritik testler başarılı!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Bazı testler başarısız. Lütfen yukarıdaki sorunları kontrol edin.${NC}"
    exit 1
fi
