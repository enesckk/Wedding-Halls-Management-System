#!/bin/bash
# API Endpoint Test Script
# Prerequisites: Backend must be running on http://localhost:5231

BASE_URL="http://localhost:5231/api/v1"
VIEWER_TOKEN=""
EDITOR_TOKEN=""
HALL_ID=""
SCHEDULE_ID=""
REQUEST_ID=""

echo "=========================================="
echo "Wedding Hall API - Endpoint Tests"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local headers=$4
    local data=$5
    local expected_status=$6
    
    echo -n "Testing: $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" $headers 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" $headers -d "$data" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (Status: $http_code)"
        ((PASSED++))
        echo "$body" | head -3
        return 0
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        ((FAILED++))
        echo "$body" | head -5
        return 1
    fi
}

# 1. Login as Viewer
echo "1. AUTH - Login (Viewer)"
VIEWER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"viewer@nikahsalon.local","password":"Viewer1!"}')
VIEWER_TOKEN=$(echo "$VIEWER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$VIEWER_TOKEN" ]; then
    echo -e "${GREEN}✓ Viewer token obtained${NC}"
    echo "Token: ${VIEWER_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Failed to get viewer token${NC}"
    echo "$VIEWER_RESPONSE"
    exit 1
fi
echo ""

# 2. Login as Editor
echo "2. AUTH - Login (Editor)"
EDITOR_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"editor@nikahsalon.local","password":"Editor1!"}')
EDITOR_TOKEN=$(echo "$EDITOR_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$EDITOR_TOKEN" ]; then
    echo -e "${GREEN}✓ Editor token obtained${NC}"
    echo "Token: ${EDITOR_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Failed to get editor token${NC}"
    echo "$EDITOR_RESPONSE"
    exit 1
fi
echo ""

# 3. Get Current User (Viewer)
echo "3. AUTH - Get Current User (Viewer)"
test_endpoint "GET /auth/me (Viewer)" "GET" "$BASE_URL/auth/me" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "200"
USER_DATA=$(curl -s -X GET "$BASE_URL/auth/me" -H "Authorization: Bearer $VIEWER_TOKEN")
echo ""

# 4. Get Current User (Unauthorized)
echo "4. AUTH - Get Current User (No Token)"
test_endpoint "GET /auth/me (Unauthorized)" "GET" "$BASE_URL/auth/me" "" "" "401"
echo ""

# 5. Get All Halls
echo "5. HALLS - Get All Halls"
HALLS_RESPONSE=$(curl -s -X GET "$BASE_URL/halls" -H "Authorization: Bearer $VIEWER_TOKEN")
HALL_ID=$(echo "$HALLS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
test_endpoint "GET /halls" "GET" "$BASE_URL/halls" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "200"
if [ -n "$HALL_ID" ]; then
    echo "First Hall ID: $HALL_ID"
fi
echo ""

# 6. Get Hall by ID
if [ -n "$HALL_ID" ]; then
    echo "6. HALLS - Get Hall by ID"
    test_endpoint "GET /halls/$HALL_ID" "GET" "$BASE_URL/halls/$HALL_ID" \
        "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "200"
    echo ""
fi

# 7. Get Hall by Invalid ID
echo "7. HALLS - Get Hall by Invalid ID"
test_endpoint "GET /halls/00000000-0000-0000-0000-000000000000" "GET" \
    "$BASE_URL/halls/00000000-0000-0000-0000-000000000000" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "404"
echo ""

# 8. Create Hall (Editor)
echo "8. HALLS - Create Hall (Editor)"
CREATE_HALL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/halls" \
    -H "Authorization: Bearer $EDITOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Hall","address":"Test Address","capacity":200,"description":"Test","imageUrl":"https://example.com/test.jpg"}')
CREATE_HALL_CODE=$(echo "$CREATE_HALL_RESPONSE" | tail -1)
if [ "$CREATE_HALL_CODE" = "201" ]; then
    echo -e "${GREEN}PASS${NC} (Status: $CREATE_HALL_CODE)"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC} (Expected: 201, Got: $CREATE_HALL_CODE)"
    ((FAILED++))
fi
echo ""

# 9. Create Hall (Viewer - Should Fail)
echo "9. HALLS - Create Hall (Viewer - Should Fail)"
test_endpoint "POST /halls (Viewer)" "POST" "$BASE_URL/halls" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\" -H \"Content-Type: application/json\"" \
    '{"name":"Unauthorized","address":"Test","capacity":100,"description":"Test","imageUrl":"https://example.com/test.jpg"}' \
    "403"
echo ""

# 10. Get Schedules by Hall
if [ -n "$HALL_ID" ]; then
    echo "10. SCHEDULES - Get Schedules by Hall"
    SCHEDULES_RESPONSE=$(curl -s -X GET "$BASE_URL/halls/$HALL_ID/schedules" \
        -H "Authorization: Bearer $VIEWER_TOKEN")
    SCHEDULE_ID=$(echo "$SCHEDULES_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    test_endpoint "GET /halls/$HALL_ID/schedules" "GET" "$BASE_URL/halls/$HALL_ID/schedules" \
        "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "200"
    if [ -n "$SCHEDULE_ID" ]; then
        echo "First Schedule ID: $SCHEDULE_ID"
    fi
    echo ""
fi

# 11. Update Schedule (Editor)
if [ -n "$SCHEDULE_ID" ]; then
    echo "11. SCHEDULES - Update Schedule (Editor)"
    test_endpoint "PUT /schedules/$SCHEDULE_ID (Editor)" "PUT" "$BASE_URL/schedules/$SCHEDULE_ID" \
        "-H \"Authorization: Bearer $EDITOR_TOKEN\" -H \"Content-Type: application/json\"" \
        '{"date":"2026-02-01","startTime":"10:00","endTime":"12:00","status":1}' \
        "200"
    echo ""
fi

# 12. Update Schedule (Viewer - Should Fail)
if [ -n "$SCHEDULE_ID" ]; then
    echo "12. SCHEDULES - Update Schedule (Viewer - Should Fail)"
    test_endpoint "PUT /schedules/$SCHEDULE_ID (Viewer)" "PUT" "$BASE_URL/schedules/$SCHEDULE_ID" \
        "-H \"Authorization: Bearer $VIEWER_TOKEN\" -H \"Content-Type: application/json\"" \
        '{"date":"2026-02-01","startTime":"10:00","endTime":"12:00","status":1}' \
        "403"
    echo ""
fi

# 13. Create Request (Viewer)
if [ -n "$HALL_ID" ]; then
    echo "13. REQUESTS - Create Request (Viewer)"
    CREATE_REQUEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/requests" \
        -H "Authorization: Bearer $VIEWER_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"weddingHallId\":\"$HALL_ID\",\"message\":\"Test request from API test\"}")
    CREATE_REQUEST_CODE=$(echo "$CREATE_REQUEST_RESPONSE" | tail -1)
    REQUEST_ID=$(echo "$CREATE_REQUEST_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ "$CREATE_REQUEST_CODE" = "201" ]; then
        echo -e "${GREEN}PASS${NC} (Status: $CREATE_REQUEST_CODE)"
        ((PASSED++))
        if [ -n "$REQUEST_ID" ]; then
            echo "Request ID: $REQUEST_ID"
        fi
    else
        echo -e "${RED}FAIL${NC} (Expected: 201, Got: $CREATE_REQUEST_CODE)"
        ((FAILED++))
    fi
    echo ""
fi

# 14. Get All Requests (Editor)
echo "14. REQUESTS - Get All Requests (Editor)"
test_endpoint "GET /requests (Editor)" "GET" "$BASE_URL/requests" \
    "-H \"Authorization: Bearer $EDITOR_TOKEN\"" "" "200"
echo ""

# 15. Get All Requests (Viewer - Should Fail)
echo "15. REQUESTS - Get All Requests (Viewer - Should Fail)"
test_endpoint "GET /requests (Viewer)" "GET" "$BASE_URL/requests" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "403"
echo ""

# 16. Answer Request (Editor)
if [ -n "$REQUEST_ID" ]; then
    echo "16. REQUESTS - Answer Request (Editor)"
    test_endpoint "PUT /requests/$REQUEST_ID/answer (Editor)" "PUT" "$BASE_URL/requests/$REQUEST_ID/answer" \
        "-H \"Authorization: Bearer $EDITOR_TOKEN\"" "" "200"
    echo ""
fi

# 17. Answer Request (Viewer - Should Fail)
if [ -n "$REQUEST_ID" ]; then
    echo "17. REQUESTS - Answer Request (Viewer - Should Fail)"
    test_endpoint "PUT /requests/$REQUEST_ID/answer (Viewer)" "PUT" "$BASE_URL/requests/$REQUEST_ID/answer" \
        "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "403"
    echo ""
fi

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
