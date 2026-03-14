# Mattybokks — Premium Digital Book Marketplace

A modern, full-stack book marketplace where authors can sell digital books with Paystack payment integration.

## Tech Stack

**Frontend:** React (Vite) · TailwindCSS v4 · React Query · React Router · Recharts
**Backend:** Node.js · Express.js · Sequelize · MySQL
**Payments:** Paystack

---

## Features

### Public Store
- Beautiful book catalog with search & genre filtering
- Book detail pages with previews
- Paystack-powered secure checkout
- Instant download after payment (token-based, 7-day expiry, 5 download limit)
- Free book downloads (no payment required)

### Admin Dashboard
- **Overview** — Revenue, sales, downloads stats with charts
- **Books Management** — Upload, edit, delete books with cover images
- **Transactions** — View all purchases with status & download tracking
- **Analytics** — Sales trends, revenue charts, top books, genre breakdown
- **Settings** — Profile management, password change, store info

---

## Setup

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Clone & Install
```bash
git clone <repo>
cd mattybokks

# Install all dependencies
npm run install:all
```

### 2. Configure Backend
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials and Paystack keys
```

### 3. Database Setup
```bash
# Create the MySQL database
mysql -u root -p -e "CREATE DATABASE mattybokks;"

# Seed the admin user
npm run db:seed
```

### 4. Run Development Servers

**Terminal 1 — Backend:**
```bash
npm run dev:backend
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
# Runs on http://localhost:5173
```

---

## Environment Variables

```env
# backend/.env
PORT=5000
DB_HOST=localhost
DB_NAME=mattybokks
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@mattybokks.com
ADMIN_PASSWORD=Admin@123
```

---

## Admin Access
After running `db:seed`:
- URL: `http://localhost:5173/admin/login`
- Email: `admin@mattybokks.com`
- Password: `Admin@123`

> **Change these in production!**

---

## Paystack Setup
1. Create a Paystack account at paystack.com
2. Get your API keys from the dashboard
3. Add them to `backend/.env`
4. For webhooks, set the URL to: `https://yourdomain.com/api/payments/webhook`

---

## Production Deployment
1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `npm run build:frontend`
3. Serve the `frontend/dist` folder via nginx or your CDN
4. Update `FRONTEND_URL` in backend `.env` to your production domain
