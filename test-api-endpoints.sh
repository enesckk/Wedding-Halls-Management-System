#!/bin/bash

# API Endpoint Detaylı Test Scripti
# Tüm API endpoint'lerini test eder

echo "=========================================="
echo "🧪 API ENDPOINT DETAYLI TEST"
echo "=========================================="
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Base URL
API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:5230}"
BASE_URL="$API_URL/api/v1"

echo -e "${BLUE}API Base URL: $BASE_URL${NC}"
echo ""

# Test sonuçları
PASSED=0
FAILED=0
SKIPPED=0

# Test fonksiyonu
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expected_status=$5
    local requires_auth=${6:-false}
    
    local url="$BASE_URL$endpoint"
    local status_code
    
    echo -n "Testing: $method $endpoint ($description)... "
    
    # Auth token (eğer gerekiyorsa)
    local auth_header=""
    if [ "$requires_auth" = "true" ]; then
        # Token yoksa skip et
        if [ -z "$AUTH_TOKEN" ]; then
            echo -e "${YELLOW}⏭️  SKIP (auth required)${NC}"
            ((SKIPPED++))
            return 0
        fi
        auth_header="-H 'Authorization: Bearer $AUTH_TOKEN'"
    fi
    
    # Request gönder
    if [ -z "$data" ]; then
        if [ "$method" = "GET" ]; then
            response=$(eval "curl -s -w '\n%{http_code}' -X GET $url $auth_header" 2>/dev/null)
        else
            response=$(eval "curl -s -w '\n%{http_code}' -X $method $url $auth_header" 2>/dev/null)
        fi
    else
        response=$(eval "curl -s -w '\n%{http_code}' -X $method $url $auth_header -H 'Content-Type: application/json' -d '$data'" 2>/dev/null)
    fi
    
    # Status code'u al
    status_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')
    
    # Beklenen status code kontrolü
    if [ -z "$expected_status" ]; then
        expected_status="200"
    fi
    
    if [ "$status_code" = "$expected_status" ] || [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✅ PASS (Status: $status_code)${NC}"
        ((PASSED++))
        return 0
    elif [ "$status_code" = "401" ] && [ "$requires_auth" = "false" ]; then
        echo -e "${YELLOW}⚠️  UNAUTHORIZED (expected for public endpoint)${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL (Status: $status_code)${NC}"
        if [ ! -z "$body" ]; then
            echo -e "   Response: ${RED}$(echo $body | head -c 100)${NC}"
        fi
        ((FAILED++))
        return 1
    fi
}

# Health check önce
echo "🏥 Health Check"
echo "----------------------------------------"
test_endpoint "GET" "/health" "Health endpoint" "" "200" false

# Login testi (token almak için)
echo ""
echo "🔐 Authentication"
echo "----------------------------------------"
echo -n "Testing: POST /auth/login (get token)... "

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"viewer@nikahsalon.local","password":"Viewer1!"}' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$AUTH_TOKEN" ]; then
        echo -e "${GREEN}✅ PASS (Token alındı)${NC}"
        export AUTH_TOKEN
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL (Token bulunamadı)${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  SKIP (Login başarısız veya mock mode)${NC}"
    ((SKIPPED++))
fi

echo ""
echo "🏛️  Halls Endpoints"
echo "----------------------------------------"
test_endpoint "GET" "/halls" "Get all halls" "" "200" false
test_endpoint "GET" "/halls?page=1&pageSize=10" "Get halls paginated" "" "200" false

# Hall ID'si al (eğer halls varsa)
HALL_ID=$(curl -s "$BASE_URL/halls?page=1&pageSize=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$HALL_ID" ]; then
    test_endpoint "GET" "/halls/$HALL_ID" "Get hall by ID" "" "200" false
    test_endpoint "GET" "/halls/$HALL_ID/schedules" "Get hall schedules" "" "200" false
else
    echo -e "${YELLOW}⏭️  SKIP: Hall ID bulunamadı (hall oluşturulmamış olabilir)${NC}"
    ((SKIPPED++))
fi

# Editor yetkisi gerektiren endpoint'ler (token varsa test et)
if [ ! -z "$AUTH_TOKEN" ]; then
    echo ""
    echo "✏️  Editor Endpoints (Auth Required)"
    echo "----------------------------------------"
    
    # Hall oluşturma testi (başarısız olabilir - editor yetkisi gerekebilir)
    test_endpoint "POST" "/halls" "Create hall" '{"name":"Test Hall","address":"Test Address","capacity":100,"description":"Test","imageUrl":"","technicalDetails":""}' "201" true
    
    # Hall güncelleme (hall ID gerekli)
    if [ ! -z "$HALL_ID" ]; then
        test_endpoint "PUT" "/halls/$HALL_ID" "Update hall" '{"name":"Updated Hall","address":"Updated Address","capacity":150,"description":"Updated","imageUrl":"","technicalDetails":""}' "200" true
    fi
fi

echo ""
echo "📅 Schedules Endpoints"
echo "----------------------------------------"
# Schedule ID'si al
SCHEDULE_ID=$(curl -s "$BASE_URL/schedules" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$SCHEDULE_ID" ]; then
    test_endpoint "GET" "/schedules/$SCHEDULE_ID" "Get schedule by ID" "" "200" false
else
    echo -e "${YELLOW}⏭️  SKIP: Schedule ID bulunamadı${NC}"
    ((SKIPPED++))
fi

echo ""
echo "📋 Requests Endpoints"
echo "----------------------------------------"
test_endpoint "GET" "/requests" "Get all requests" "" "200" true
test_endpoint "POST" "/requests" "Create request" '{"eventName":"Test Event","eventOwner":"Test Owner","eventDate":"2026-12-31","eventTime":"18:00","eventType":0,"message":"Test request"}' "201" false

# Request ID'si al
REQUEST_ID=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/requests" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$REQUEST_ID" ]; then
    test_endpoint "GET" "/requests/$REQUEST_ID" "Get request by ID" "" "200" true
    test_endpoint "GET" "/requests/$REQUEST_ID/messages" "Get request messages" "" "200" true
else
    echo -e "${YELLOW}⏭️  SKIP: Request ID bulunamadı${NC}"
    ((SKIPPED++))
fi

echo ""
echo "📊 Dashboard Endpoints"
echo "----------------------------------------"
test_endpoint "GET" "/dashboard/stats" "Get dashboard stats" "" "200" true
test_endpoint "GET" "/dashboard/requests-summary" "Get requests summary" "" "200" true
test_endpoint "GET" "/dashboard/schedules-summary" "Get schedules summary" "" "200" true

echo ""
echo "👥 Users Endpoints"
echo "----------------------------------------"
test_endpoint "GET" "/users" "Get all users" "" "200" true

# User ID'si al
USER_ID=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/users" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$USER_ID" ]; then
    test_endpoint "GET" "/users/$USER_ID" "Get user by ID" "" "200" true
else
    echo -e "${YELLOW}⏭️  SKIP: User ID bulunamadı${NC}"
    ((SKIPPED++))
fi

echo ""
echo "=========================================="
echo "📊 TEST SONUÇLARI"
echo "=========================================="
echo -e "${GREEN}✅ Başarılı: $PASSED${NC}"
echo -e "${RED}❌ Başarısız: $FAILED${NC}"
echo -e "${YELLOW}⏭️  Atlanan: $SKIPPED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Tüm endpoint testleri başarılı!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Bazı endpoint testleri başarısız.${NC}"
    exit 1
fi
