# Wedding Hall Management System - Frontend

Next.js 16 App Router frontend for the Wedding Hall Management System.

📦 **For production deployment on Plesk, see [DEPLOYMENT.md](./DEPLOYMENT.md)**  
🔧 **Backend çalıştırma rehberi için [BACKEND_REHBERI.md](./BACKEND_REHBERI.md)** bakın

## Development

### Hızlı Başlangıç

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   # .env.local dosyası oluşturun
   echo NEXT_PUBLIC_API_URL=http://localhost:5230 > .env.local
   ```
   
   Veya manuel olarak `.env.local` dosyası oluşturup şunu ekleyin:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5230
   ```

3. **Backend'i başlatın:**
   
   Backend ayrı bir klasörde (örn: `../wedding-hall-api`). Backend'i çalıştırmak için:
   
   ```bash
   # Backend klasörüne gidin
   cd ../wedding-hall-api
   
   # Backend'i çalıştırın
   dotnet run
   ```
   
   Backend `http://localhost:5230` adresinde çalışacak.

4. **Frontend'i başlatın:**
   
   Yeni bir terminal açın ve:
   ```bash
   npm run dev
   ```
   
   Frontend `http://localhost:3000` adresinde çalışacak.

### Otomatik Başlatma (PowerShell)

Her iki projeyi birlikte başlatmak için:

```powershell
.\start-backend.ps1
```

Bu script:
- Backend klasörünü bulur
- Backend'i port 5230'da başlatır
- Frontend'i port 3000'de başlatır
- Her ikisini ayrı PowerShell pencerelerinde gösterir

### Manuel Çalıştırma

**Terminal 1 - Backend:**
```bash
cd ../wedding-hall-api
dotnet run
```

**Terminal 2 - Frontend:**
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

## Backend Gereksinimleri

Backend'i çalıştırmak için:
- .NET SDK 7.0 veya üzeri
- PostgreSQL veritabanı
- Backend projesi ayrı bir klasörde

Detaylı bilgi için [BACKEND_REHBERI.md](./BACKEND_REHBERI.md) dosyasına bakın.
