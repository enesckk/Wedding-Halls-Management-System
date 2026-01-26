# Production Deployment Guide - Plesk

This guide covers deploying the Wedding Hall Management System to Plesk hosting.

## Prerequisites

- Plesk hosting with .NET Core support
- PostgreSQL database (via Plesk or remote)
- Domain/subdomain configured
- SSH access (recommended) or Plesk File Manager

---

## Backend Deployment (ASP.NET Core API)

### Step 1: Prepare Backend

1. **Build and publish locally:**
   ```bash
   cd wedding-hall-api
   dotnet publish src/NikahSalon.API -c Release -o ./publish
   ```

2. **Verify publish output:**
   - Check `publish/` folder contains:
     - `NikahSalon.API.dll`
     - `appsettings.json`
     - `appsettings.Production.json`
     - All dependencies

### Step 2: Upload to Plesk

1. **Via Plesk File Manager:**
   - Navigate to your domain's `httpdocs` or custom folder (e.g., `api/`)
   - Upload all files from `publish/` folder

2. **Via FTP/SFTP:**
   ```bash
   # Upload publish/ contents to your domain's API folder
   scp -r publish/* user@yourdomain.com:/path/to/api/
   ```

### Step 3: Configure Plesk .NET Core Application

1. **In Plesk:**
   - Go to **Domains** → Your Domain → **.NET Core Settings**
   - **Application name:** `NikahSalon.API`
   - **Startup file:** `NikahSalon.API.dll`
   - **Runtime:** `.NET 9.0` (or `.NET 8.0` if available)
   - **Environment:** `Production`
   - **Port:** Leave default or set custom port
   - Click **Apply**

### Step 4: Configure Environment Variables

In Plesk **.NET Core Settings** → **Environment Variables**, add:

```
CONNECTION_STRING=Host=localhost;Port=5432;Database=nikahsalon;Username=your_user;Password=your_password
JWT_SECRET_KEY=YourSuperSecretKeyForJwtTokensMustBeAtLeast32CharactersLong!
JWT_ISSUER=NikahSalon
JWT_AUDIENCE=NikahSalon
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
ASPNETCORE_ENVIRONMENT=Production
```

**Or** update `appsettings.Production.json` directly (less secure):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=your_user;Password=your_password"
  },
  "Jwt": {
    "SecretKey": "YourSuperSecretKeyForJwtTokensMustBeAtLeast32CharactersLong!",
    "Issuer": "NikahSalon",
    "Audience": "NikahSalon"
  },
  "Cors": {
    "Origins": ["https://yourdomain.com", "https://www.yourdomain.com"]
  }
}
```

### Step 5: Database Setup

1. **Create PostgreSQL database in Plesk:**
   - Go to **Databases** → **Add Database**
   - Database name: `nikahsalon`
   - Create user and note credentials

2. **Run migrations (via SSH or Plesk Terminal):**
   ```bash
   cd /path/to/api
   dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
   ```
   
   **Or** if migrations are already in publish folder:
   ```bash
   # Ensure dotnet-ef is available on server
   dotnet tool install --global dotnet-ef
   dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
   ```

3. **Seed data runs automatically** on first app start via `SeedData.SeedAsync()`.

### Step 6: Configure Reverse Proxy (if needed)

If API is on a subdomain (e.g., `api.yourdomain.com`):

1. **Plesk → Domains → Your Domain → Apache & nginx Settings**
2. **Additional nginx directives:**
   ```nginx
   location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection keep-alive;
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```
   (Adjust port to match your .NET Core app port)

### Step 7: SSL/HTTPS

1. **Plesk → SSL/TLS Settings**
2. **Install SSL certificate** (Let's Encrypt recommended)
3. **Force HTTPS redirect** (optional, via nginx)

---

## Frontend Deployment (Next.js)

### Option A: Node.js Application (Recommended)

1. **Build locally (optional, for testing):**
   ```bash
   cd wedding-hall-ui
   npm install
   npm run build
   ```

2. **Upload to Plesk:**
   - Upload entire `wedding-hall-ui/` folder to domain root or subdomain

3. **Configure Node.js in Plesk:**
   - Go to **Domains** → Your Domain → **Node.js**
   - **Application root:** `/wedding-hall-ui` (or your folder)
   - **Application startup file:** `server.js` (or create one)
   - **Application mode:** `production`
   - **Node.js version:** Latest LTS (18+ or 20+)

4. **Create `server.js` in frontend root:**
   ```javascript
   const { createServer } = require('http')
   const { parse } = require('url')
   const next = require('next')

   const dev = process.env.NODE_ENV !== 'production'
   const hostname = 'localhost'
   const port = process.env.PORT || 3000

   const app = next({ dev, hostname, port })
   const handle = app.getRequestHandler()

   app.prepare().then(() => {
     createServer(async (req, res) => {
       try {
         const parsedUrl = parse(req.url, true)
         await handle(req, res, parsedUrl)
       } catch (err) {
         console.error('Error occurred handling', req.url, err)
         res.statusCode = 500
         res.end('internal server error')
       }
     }).listen(port, (err) => {
       if (err) throw err
       console.log(`> Ready on http://${hostname}:${port}`)
     })
   })
   ```

5. **Update `package.json` scripts:**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "build": "next build"
     }
   }
   ```

6. **Set environment variables in Plesk Node.js settings:**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   PORT=3000
   ```

7. **Install dependencies and build:**
   ```bash
   npm install --production
   npm run build
   ```

8. **Start application** in Plesk Node.js settings

### Option B: Static Export (Alternative)

1. **Update `next.config.mjs`:**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     typescript: {
       ignoreBuildErrors: true,
     },
     images: {
       unoptimized: true,
     },
   }
   export default nextConfig
   ```

2. **Build static export:**
   ```bash
   npm run build
   ```

3. **Upload `out/` folder** to Plesk `httpdocs/`

4. **Note:** Static export doesn't support API routes or server-side features. Use Option A if you need full Next.js features.

---

## Environment Variables Summary

### Backend (.NET Core)

| Variable | Description | Example |
|----------|-------------|---------|
| `CONNECTION_STRING` | PostgreSQL connection | `Host=localhost;Port=5432;Database=nikahsalon;Username=user;Password=pass` |
| `JWT_SECRET_KEY` | JWT signing key (min 32 chars) | `YourSuperSecretKeyForJwtTokensMustBeAtLeast32CharactersLong!` |
| `JWT_ISSUER` | JWT issuer | `NikahSalon` |
| `JWT_AUDIENCE` | JWT audience | `NikahSalon` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `https://yourdomain.com,https://www.yourdomain.com` |
| `ASPNETCORE_ENVIRONMENT` | Environment name | `Production` |

### Frontend (Next.js)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.yourdomain.com` |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port (Node.js mode) | `3000` |

---

## Post-Deployment Checklist

- [ ] Backend API accessible at `https://api.yourdomain.com`
- [ ] Frontend accessible at `https://yourdomain.com`
- [ ] Database migrations applied
- [ ] Seed data created (check via login with demo users)
- [ ] CORS configured correctly (frontend can call API)
- [ ] SSL certificates installed
- [ ] Environment variables set
- [ ] Logs accessible (check Plesk logs)
- [ ] Swagger disabled in production (already done via `if (app.Environment.IsDevelopment())`)

---

## Troubleshooting

### Backend Issues

**"ConnectionStrings:DefaultConnection is not set"**
- Set `CONNECTION_STRING` environment variable in Plesk

**"Jwt:SecretKey is not configured"**
- Set `JWT_SECRET_KEY` environment variable

**CORS errors**
- Verify `CORS_ORIGINS` includes your frontend domain
- Check frontend `NEXT_PUBLIC_API_URL` matches backend URL

**Database connection fails**
- Verify PostgreSQL is running
- Check connection string credentials
- Ensure database exists

### Frontend Issues

**"NEXT_PUBLIC_API_URL is not defined"**
- Set `NEXT_PUBLIC_API_URL` in Plesk Node.js environment variables
- Restart Node.js application

**Build fails**
- Run `npm install` before `npm run build`
- Check Node.js version (18+ required)

**API calls fail**
- Verify backend is running
- Check CORS configuration
- Verify `NEXT_PUBLIC_API_URL` is correct

---

## Security Notes

1. **Never commit** `appsettings.Production.json` with real credentials to git
2. **Use environment variables** for sensitive data (recommended)
3. **Use strong JWT secret** (min 32 characters, random)
4. **Enable HTTPS** for both frontend and backend
5. **Restrict CORS origins** to your production domains only
6. **Disable Swagger** in production (already configured)

---

## Maintenance

### Updating Backend

1. Build and publish locally
2. Upload new `publish/` contents
3. Restart .NET Core application in Plesk

### Updating Frontend

1. Upload new files
2. Run `npm install` (if dependencies changed)
3. Run `npm run build`
4. Restart Node.js application

### Database Migrations

1. Create migration locally
2. Upload migration files to server
3. Run `dotnet ef database update` via SSH/Plesk Terminal
