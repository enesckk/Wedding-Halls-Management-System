# Frontend Deployment Guide - Plesk

This guide covers deploying the Next.js frontend to Plesk hosting.

## Prerequisites

- Plesk hosting with Node.js support
- Backend API deployed and accessible
- Domain/subdomain configured

---

## Deployment Steps

### Step 1: Prepare Environment Variables

1. **Copy `.env.production.example` to `.env.production`:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Update `.env.production`:**
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

   **Or** set in Plesk Node.js environment variables (recommended):
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
   - `NODE_ENV=production`
   - `PORT=3000`

### Step 2: Upload Files

Upload entire `wedding-hall-ui/` folder to your domain root or subdomain folder via:
- **Plesk File Manager**
- **FTP/SFTP**
- **Git** (if configured)

### Step 3: Configure Node.js in Plesk

1. **Go to:** Domains → Your Domain → **Node.js**

2. **Settings:**
   - **Application root:** `/wedding-hall-ui` (or your folder path)
   - **Application startup file:** `server.js`
   - **Application mode:** `production`
   - **Node.js version:** Latest LTS (18+ or 20+)

3. **Environment variables** (set in Plesk Node.js settings):
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   PORT=3000
   ```

### Step 4: Install Dependencies

**Via Plesk Terminal or SSH:**
```bash
cd /path/to/wedding-hall-ui
npm install --production
```

### Step 5: Build Application

```bash
npm run build
```

This creates `.next/` folder with optimized production build.

### Step 6: Start Application

In Plesk Node.js settings, click **Start** or **Restart**.

The app will be available at your domain URL.

---

## Alternative: Static Export

If you prefer static hosting (no server-side features):

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

2. **Build:**
   ```bash
   npm run build
   ```

3. **Upload `out/` folder** to Plesk `httpdocs/`

**Note:** Static export doesn't support:
- API routes
- Server-side rendering
- Dynamic routes with `getServerSideProps`

Use Node.js mode (above) for full Next.js features.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (no trailing slash) | `https://api.yourdomain.com` |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port (Node.js mode) | `3000` |

---

## Troubleshooting

**"NEXT_PUBLIC_API_URL is not defined"**
- Set `NEXT_PUBLIC_API_URL` in Plesk Node.js environment variables
- Restart Node.js application
- Rebuild: `npm run build`

**Build fails**
- Run `npm install` first
- Check Node.js version (18+ required)
- Verify all dependencies are installed

**API calls fail (CORS errors)**
- Verify backend CORS includes your frontend domain
- Check `NEXT_PUBLIC_API_URL` matches backend URL exactly
- Ensure backend is running

**Application won't start**
- Check `server.js` exists in application root
- Verify Node.js version matches requirements
- Check Plesk logs for errors

---

## Updating Frontend

1. Upload new files
2. Run `npm install` (if `package.json` changed)
3. Run `npm run build`
4. Restart Node.js application in Plesk

---

## Production Checklist

- [ ] `.env.production` configured (or environment variables set)
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] `npm run build` completed successfully
- [ ] Node.js application started in Plesk
- [ ] Frontend accessible at domain URL
- [ ] API calls working (test login)
- [ ] SSL certificate installed
