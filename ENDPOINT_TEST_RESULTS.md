# API Endpoint Test Results

**Date:** 2026-01-23  
**Backend URL:** http://localhost:5231  
**Environment:** Development (for testing, Production config validated separately)

---

## Test Execution

To run the tests:

1. **Start the backend:**
   ```bash
   cd wedding-hall-api
   dotnet run --project src/NikahSalon.API --urls "http://localhost:5231"
   ```

2. **Run the test script:**
   ```bash
   ./test_endpoints.sh
   ```

3. **Or use the HTTP file:**
   - Open `API_TESTS.http` in VS Code with REST Client extension
   - Or import to Postman

---

## Expected Test Results

### ✅ AUTH Endpoints

| Endpoint | Method | Auth | Expected Status | Description |
|----------|--------|------|-----------------|-------------|
| `/api/v1/auth/login` | POST | None | 200 | Login as Viewer |
| `/api/v1/auth/login` | POST | None | 200 | Login as Editor |
| `/api/v1/auth/me` | GET | Viewer Token | 200 | Get current user (Viewer) |
| `/api/v1/auth/me` | GET | Editor Token | 200 | Get current user (Editor) |
| `/api/v1/auth/me` | GET | None | 401 | Unauthorized access |

### ✅ HALLS Endpoints

| Endpoint | Method | Auth | Expected Status | Description |
|----------|--------|------|-----------------|-------------|
| `/api/v1/halls` | GET | Viewer/Editor | 200 | Get all halls |
| `/api/v1/halls/{id}` | GET | Viewer/Editor | 200 | Get hall by ID |
| `/api/v1/halls/{id}` | GET | Viewer/Editor | 404 | Invalid hall ID |
| `/api/v1/halls` | POST | Editor | 201 | Create hall (Editor only) |
| `/api/v1/halls` | POST | Viewer | 403 | Create hall (Viewer forbidden) |
| `/api/v1/halls/{id}` | PUT | Editor | 200 | Update hall (Editor only) |

### ✅ SCHEDULES Endpoints

| Endpoint | Method | Auth | Expected Status | Description |
|----------|--------|------|-----------------|-------------|
| `/api/v1/halls/{id}/schedules` | GET | Viewer/Editor | 200 | Get schedules by hall |
| `/api/v1/schedules/{id}` | PUT | Editor | 200 | Update schedule (Editor only) |
| `/api/v1/schedules/{id}` | PUT | Viewer | 403 | Update schedule (Viewer forbidden) |

### ✅ REQUESTS Endpoints

| Endpoint | Method | Auth | Expected Status | Description |
|----------|--------|------|-----------------|-------------|
| `/api/v1/requests` | POST | Viewer | 201 | Create request (Viewer only) |
| `/api/v1/requests` | POST | None | 401 | Create request (Unauthorized) |
| `/api/v1/requests` | GET | Editor | 200 | Get all requests (Editor only) |
| `/api/v1/requests` | GET | Viewer | 403 | Get all requests (Viewer forbidden) |
| `/api/v1/requests/{id}/answer` | PUT | Editor | 200 | Answer request (Editor only) |
| `/api/v1/requests/{id}/answer` | PUT | Viewer | 403 | Answer request (Viewer forbidden) |

### ✅ MESSAGES Endpoints

| Endpoint | Method | Auth | Expected Status | Description |
|----------|--------|------|-----------------|-------------|
| `/api/v1/requests/{id}/messages` | GET | Viewer/Editor | 200 | Get messages by request |
| `/api/v1/requests/{id}/messages` | POST | Viewer | 201 | Create message (Viewer) |
| `/api/v1/requests/{id}/messages` | POST | Editor | 201 | Create message (Editor) |

---

## Validation Checklist

### HTTP Status Codes
- ✅ 200 OK - Successful GET/PUT requests
- ✅ 201 Created - Successful POST requests
- ✅ 401 Unauthorized - Missing/invalid JWT token
- ✅ 403 Forbidden - Insufficient permissions (role-based)
- ✅ 404 Not Found - Resource not found

### Authorization
- ✅ JWT token required for protected endpoints
- ✅ Viewer role can access viewer-only endpoints
- ✅ Editor role can access all endpoints
- ✅ 401 returned when token is missing
- ✅ 403 returned when role is insufficient

### Data Consistency
- ✅ Created resources are returned with correct IDs
- ✅ Updated resources reflect changes immediately
- ✅ Related resources (halls → schedules, requests → messages) are linked correctly

---

## Test Credentials

**Viewer:**
- Email: `viewer@nikahsalon.local`
- Password: `Viewer1!`

**Editor:**
- Email: `editor@nikahsalon.local`
- Password: `Editor1!`

---

## Notes

1. **Database Required:** Ensure database is set up and migrations are applied (or use `EnsureCreated` for testing)
2. **Seed Data:** Seed data creates demo users and sample halls automatically on startup
3. **JWT Tokens:** Tokens expire after 60 minutes (configurable)
4. **CORS:** Configured for `http://localhost:3000` and production origins

---

## Troubleshooting

**Backend won't start:**
- Check database connection string in `appsettings.json`
- Ensure PostgreSQL is running
- Verify database exists: `psql -U <username> -d nikahsalon -c "SELECT 1;"`

**401 Unauthorized:**
- Verify JWT token is included in `Authorization: Bearer <token>` header
- Check token hasn't expired
- Ensure login endpoint returned valid token

**403 Forbidden:**
- Verify user has correct role (Viewer vs Editor)
- Check endpoint requires Editor role
- Ensure JWT token contains correct role claim

**404 Not Found:**
- Verify resource ID exists in database
- Check ID format (must be valid GUID)
- Ensure resource wasn't deleted

---

## Test Results Template

When running tests, document results:

```
Test Date: [DATE]
Backend Version: [VERSION]
Environment: [Development/Production]

Results:
- AUTH endpoints: [PASS/FAIL]
- HALLS endpoints: [PASS/FAIL]
- SCHEDULES endpoints: [PASS/FAIL]
- REQUESTS endpoints: [PASS/FAIL]
- MESSAGES endpoints: [PASS/FAIL]

Issues Found:
- [List any issues]

Notes:
- [Additional notes]
```
