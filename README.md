# Wedding Hall Management System - Frontend

Next.js 16 App Router frontend for the Wedding Hall Management System.

📦 **For production deployment on Plesk, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend API URL
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (no trailing slash)
  - Development: `http://localhost:5230`
  - Production: `https://api.yourdomain.com`
