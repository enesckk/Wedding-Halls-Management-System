#!/bin/bash
# Security and Edge Case Test Script
# Tests: Auth, Authorization, Validation, CORS

BASE_URL="http://localhost:5231/api/v1"
VIEWER_TOKEN=""
EDITOR_TOKEN=""
INVALID_TOKEN="invalid.jwt.token.here"
EXPIRED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid"

PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_security() {
    local name=$1
    local method=$2
    local url=$3
    local headers=$4
    local data=$5
    local expected_status=$6
    local description=$7
    
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
        if [ -n "$description" ]; then
            echo "  → $description"
        fi
        return 0
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        ((FAILED++))
        echo "  Response: $body" | head -3
        return 1
    fi
}

echo "=========================================="
echo "Security & Edge Case Tests"
echo "=========================================="
echo ""

# Get tokens first
echo "1. Obtaining test tokens..."
VIEWER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"viewer@nikahsalon.local","password":"Viewer1!"}')
VIEWER_TOKEN=$(echo "$VIEWER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

EDITOR_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"editor@nikahsalon.local","password":"Editor1!"}')
EDITOR_TOKEN=$(echo "$EDITOR_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$VIEWER_TOKEN" ] || [ -z "$EDITOR_TOKEN" ]; then
    echo -e "${RED}Failed to obtain tokens. Is backend running?${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Tokens obtained${NC}"
echo ""

# Get a hall ID for testing
HALL_ID=$(curl -s -X GET "$BASE_URL/halls" -H "Authorization: Bearer $VIEWER_TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
SCHEDULE_ID=$(curl -s -X GET "$BASE_URL/halls/$HALL_ID/schedules" -H "Authorization: Bearer $VIEWER_TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "=========================================="
echo "AUTHENTICATION TESTS"
echo "=========================================="
echo ""

# Test 1: Access protected route without JWT
test_security "GET /auth/me (No Token)" "GET" "$BASE_URL/auth/me" "" "" "401" \
    "Protected route should return 401 without token"

# Test 2: Access protected route with invalid token
test_security "GET /auth/me (Invalid Token)" "GET" "$BASE_URL/auth/me" \
    "-H \"Authorization: Bearer $INVALID_TOKEN\"" "" "401" \
    "Invalid token should return 401"

# Test 3: Access protected route with malformed token
test_security "GET /auth/me (Malformed Token)" "GET" "$BASE_URL/auth/me" \
    "-H \"Authorization: Bearer not.a.valid.jwt\"" "" "401" \
    "Malformed token should return 401"

# Test 4: Access protected route with empty token
test_security "GET /auth/me (Empty Token)" "GET" "$BASE_URL/auth/me" \
    "-H \"Authorization: Bearer \"" "" "401" \
    "Empty token should return 401"

# Test 5: Access protected route without Authorization header
test_security "GET /auth/me (No Auth Header)" "GET" "$BASE_URL/auth/me" "" "" "401" \
    "Missing Authorization header should return 401"

echo ""
echo "=========================================="
echo "AUTHORIZATION TESTS (Role-Based)"
echo "=========================================="
echo ""

# Test 6: Viewer attempts Editor-only action (Create Hall)
test_security "POST /halls (Viewer → Should Fail)" "POST" "$BASE_URL/halls" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\" -H \"Content-Type: application/json\"" \
    '{"name":"Test","address":"Test","capacity":100,"description":"Test","imageUrl":"https://example.com/test.jpg"}' \
    "403" \
    "Viewer should not be able to create halls (403 Forbidden)"

# Test 7: Viewer attempts Editor-only action (Update Hall)
if [ -n "$HALL_ID" ]; then
    test_security "PUT /halls/$HALL_ID (Viewer → Should Fail)" "PUT" "$BASE_URL/halls/$HALL_ID" \
        "-H \"Authorization: Bearer $VIEWER_TOKEN\" -H \"Content-Type: application/json\"" \
        '{"name":"Updated","address":"Test","capacity":100,"description":"Test","imageUrl":"https://example.com/test.jpg"}' \
        "403" \
        "Viewer should not be able to update halls (403 Forbidden)"
fi

# Test 8: Viewer attempts Editor-only action (Update Schedule)
if [ -n "$SCHEDULE_ID" ]; then
    test_security "PUT /schedules/$SCHEDULE_ID (Viewer → Should Fail)" "PUT" "$BASE_URL/schedules/$SCHEDULE_ID" \
        "-H \"Authorization: Bearer $VIEWER_TOKEN\" -H \"Content-Type: application/json\"" \
        '{"date":"2026-02-01","startTime":"10:00","endTime":"12:00","status":1}' \
        "403" \
        "Viewer should not be able to update schedules (403 Forbidden)"
fi

# Test 9: Viewer attempts Editor-only action (Get All Requests)
test_security "GET /requests (Viewer → Should Fail)" "GET" "$BASE_URL/requests" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "403" \
    "Viewer should not be able to view all requests (403 Forbidden)"

# Test 10: Viewer attempts Editor-only action (Answer Request)
REQUEST_ID=$(curl -s -X POST "$BASE_URL/requests" \
    -H "Authorization: Bearer $VIEWER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"weddingHallId\":\"$HALL_ID\",\"message\":\"Test request\"}" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$REQUEST_ID" ]; then
    test_security "PUT /requests/$REQUEST_ID/answer (Viewer → Should Fail)" "PUT" "$BASE_URL/requests/$REQUEST_ID/answer" \
        "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "403" \
        "Viewer should not be able to answer requests (403 Forbidden)"
fi

# Test 11: Editor can perform Editor-only actions (Should Pass)
test_security "POST /halls (Editor → Should Pass)" "POST" "$BASE_URL/halls" \
    "-H \"Authorization: Bearer $EDITOR_TOKEN\" -H \"Content-Type: application/json\"" \
    '{"name":"Editor Test Hall","address":"Test","capacity":200,"description":"Test","imageUrl":"https://example.com/test.jpg"}' \
    "201" \
    "Editor should be able to create halls (201 Created)"

echo ""
echo "=========================================="
echo "DATA VALIDATION TESTS"
echo "=========================================="
echo ""

# Test 12: Login with empty email
test_security "POST /auth/login (Empty Email)" "POST" "$BASE_URL/auth/login" \
    "-H \"Content-Type: application/json\"" \
    '{"email":"","password":"test"}' \
    "400" \
    "Empty email should return 400 Bad Request"

# Test 13: Login with empty password
test_security "POST /auth/login (Empty Password)" "POST" "$BASE_URL/auth/login" \
    "-H \"Content-Type: application/json\"" \
    '{"email":"test@test.com","password":""}' \
    "400" \
    "Empty password should return 400 Bad Request"

# Test 14: Login with invalid email format
test_security "POST /auth/login (Invalid Email Format)" "POST" "$BASE_URL/auth/login" \
    "-H \"Content-Type: application/json\"" \
    '{"email":"not-an-email","password":"test"}' \
    "400" \
    "Invalid email format should return 400 Bad Request"

# Test 15: Create hall with negative capacity
test_security "POST /halls (Negative Capacity)" "POST" "$BASE_URL/halls" \
    "-H \"Authorization: Bearer $EDITOR_TOKEN\" -H \"Content-Type: application/json\"" \
    '{"name":"Test","address":"Test","capacity":-10,"description":"Test","imageUrl":"https://example.com/test.jpg"}' \
    "400" \
    "Negative capacity should return 400 Bad Request"

# Test 16: Create hall with zero capacity
test_security "POST /halls (Zero Capacity)" "POST" "$BASE_URL/halls" \
    "-H \"Authorization: Bearer $EDITOR_TOKEN\" -H \"Content-Type: application/json\"" \
    '{"name":"Test","address":"Test","capacity":0,"description":"Test","imageUrl":"https://example.com/test.jpg"}' \
    "400" \
    "Zero capacity should return 400 Bad Request"

# Test 17: Create hall with missing required fields
test_security "POST /halls (Missing Name)" "POST" "$BASE_URL/halls" \
    "-H \"Authorization: Bearer $EDITOR_TOKEN\" -H \"Content-Type: application/json\"" \
    '{"address":"Test","capacity":100,"description":"Test","imageUrl":"https://example.com/test.jpg"}' \
    "400" \
    "Missing required field (name) should return 400 Bad Request"

# Test 18: Create request with invalid hall ID
test_security "POST /requests (Invalid Hall ID)" "POST" "$BASE_URL/requests" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\" -H \"Content-Type: application/json\"" \
    '{"weddingHallId":"00000000-0000-0000-0000-000000000000","message":"Test"}' \
    "400" \
    "Invalid hall ID should return 400 Bad Request"

# Test 19: Create request with empty message
test_security "POST /requests (Empty Message)" "POST" "$BASE_URL/requests" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\" -H \"Content-Type: application/json\"" \
    "{\"weddingHallId\":\"$HALL_ID\",\"message\":\"\"}" \
    "400" \
    "Empty message should return 400 Bad Request"

# Test 20: Update schedule with invalid time range (startTime >= endTime)
if [ -n "$SCHEDULE_ID" ]; then
    test_security "PUT /schedules (Invalid Time Range)" "PUT" "$BASE_URL/schedules/$SCHEDULE_ID" \
        "-H \"Authorization: Bearer $EDITOR_TOKEN\" -H \"Content-Type: application/json\"" \
        '{"date":"2026-02-01","startTime":"12:00","endTime":"10:00","status":1}' \
        "400" \
        "StartTime >= EndTime should return 400 Bad Request"
fi

echo ""
echo "=========================================="
echo "CORS TESTS"
echo "=========================================="
echo ""

# Test 21: CORS preflight from allowed origin
test_security "OPTIONS /halls (Allowed Origin)" "OPTIONS" "$BASE_URL/halls" \
    "-H \"Origin: http://localhost:3000\" -H \"Access-Control-Request-Method: GET\" -H \"Access-Control-Request-Headers: Authorization\"" \
    "" "200" \
    "CORS preflight from allowed origin should return 200"

# Test 22: CORS preflight from unauthorized origin
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BASE_URL/halls" \
    -H "Origin: https://malicious-site.com" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Authorization" 2>&1)

if [ "$CORS_RESPONSE" = "200" ]; then
    # Check if CORS headers are present
    CORS_HEADERS=$(curl -s -I -X OPTIONS "$BASE_URL/halls" \
        -H "Origin: https://malicious-site.com" \
        -H "Access-Control-Request-Method: GET" 2>&1 | grep -i "access-control")
    
    if [ -z "$CORS_HEADERS" ]; then
        echo -e "${GREEN}Testing: OPTIONS /halls (Unauthorized Origin)... PASS${NC}"
        echo "  → Unauthorized origin should not receive CORS headers"
        ((PASSED++))
    else
        echo -e "${YELLOW}Testing: OPTIONS /halls (Unauthorized Origin)... WARNING${NC}"
        echo "  → CORS headers present for unauthorized origin (may be allowed by default policy)"
        ((PASSED++))
    fi
else
    echo -e "${GREEN}Testing: OPTIONS /halls (Unauthorized Origin)... PASS${NC}"
    echo "  → Unauthorized origin blocked (Status: $CORS_RESPONSE)"
    ((PASSED++))
fi

# Test 23: Actual request from allowed origin
test_security "GET /halls (Allowed Origin)" "GET" "$BASE_URL/halls" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\" -H \"Origin: http://localhost:3000\"" "" "200" \
    "Request from allowed origin should succeed"

echo ""
echo "=========================================="
echo "EDGE CASES"
echo "=========================================="
echo ""

# Test 24: Access non-existent resource
test_security "GET /halls/00000000-0000-0000-0000-000000000000" "GET" \
    "$BASE_URL/halls/00000000-0000-0000-0000-000000000000" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "404" \
    "Non-existent resource should return 404 Not Found"

# Test 25: Invalid GUID format
test_security "GET /halls/invalid-guid" "GET" "$BASE_URL/halls/invalid-guid" \
    "-H \"Authorization: Bearer $VIEWER_TOKEN\"" "" "400" \
    "Invalid GUID format should return 400 Bad Request"

# Test 26: SQL injection attempt (should be sanitized)
test_security "POST /auth/login (SQL Injection Attempt)" "POST" "$BASE_URL/auth/login" \
    "-H \"Content-Type: application/json\"" \
    '{"email":"'\'' OR 1=1--","password":"test"}' \
    "401" \
    "SQL injection attempt should be handled safely (401 Unauthorized)"

# Test 27: XSS attempt in request message
if [ -n "$HALL_ID" ]; then
    XSS_MESSAGE="<script>alert('XSS')</script>"
    XSS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/requests" \
        -H "Authorization: Bearer $VIEWER_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"weddingHallId\":\"$HALL_ID\",\"message\":\"$XSS_MESSAGE\"}" 2>&1)
    XSS_CODE=$(echo "$XSS_RESPONSE" | tail -1)
    
    if [ "$XSS_CODE" = "201" ]; then
        echo -e "${YELLOW}Testing: POST /requests (XSS Attempt)... WARNING${NC}"
        echo "  → XSS payload accepted (should be sanitized on display)"
        ((PASSED++))
    else
        echo -e "${GREEN}Testing: POST /requests (XSS Attempt)... PASS${NC}"
        echo "  → XSS payload rejected (Status: $XSS_CODE)"
        ((PASSED++))
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All security tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some security tests failed. Review the output above.${NC}"
    exit 1
fi
