# MediExpress - Deployment Guide

## 🚀 Quick Deploy

### Option 1: Render.com (Recommended - Free Tier)

1. Push code to GitHub:
```bash
cd mediexpress
git init
git add .
git commit -m "MediExpress MVP"
git remote add origin https://github.com/YOUR_USERNAME/mediexpress.git
git push -u origin main
```

2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Environment Variables**:
     - `MONGO_URI` = Your MongoDB Atlas connection string
     - `JWT_SECRET` = Any strong random string
     - `NODE_ENV` = `production`
     - `PORT` = `10000` (Render default)

### Option 2: Railway.app

1. Push to GitHub (same as above)
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add MongoDB plugin (or use Atlas)
4. Set environment variables (same as Render)
5. Set build & start commands same as Render

### Option 3: VPS (DigitalOcean/AWS/etc)

```bash
# On your VPS
git clone https://github.com/YOUR_USERNAME/mediexpress.git
cd mediexpress
cd frontend && npm install && npm run build
cd ../backend && npm install

# Set environment variables
export MONGO_URI="mongodb+srv://..."
export JWT_SECRET="your-secret-key"
export NODE_ENV="production"
export PORT="5001"

# Start with PM2
npm install -g pm2
cd backend && pm2 start server.js --name mediexpress
```

---

## 🗄️ MongoDB Atlas Setup (Required for deployment)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free cluster
2. Create a database user (username + password)
3. Whitelist IP: `0.0.0.0/0` (allow all)
4. Get connection string: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/mediexpress`
5. Set this as `MONGO_URI` environment variable

> **Note:** The in-memory MongoDB is for local dev only. For production, you MUST use MongoDB Atlas or a real MongoDB instance.

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/mediexpress` |
| `JWT_SECRET` | JWT signing secret | `my-super-secret-key-change-this` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5001` |

---

## 📂 Project Structure
```
mediexpress/
├── backend/           # Express API server
│   ├── config/        # DB connection + seed data
│   ├── middleware/     # JWT auth middleware
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── uploads/       # File uploads
│   └── server.js      # Main server (serves frontend in prod)
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/       # Axios API client
│   │   ├── components/# Navbar, Chatbot, StatusBadge
│   │   ├── context/   # Auth context
│   │   ├── data/      # 100 OTC medicines
│   │   └── pages/     # All page components
│   └── dist/          # Production build output
├── package.json       # Root deploy scripts
├── Procfile           # Render/Heroku process file
└── .gitignore
```

## 🧪 Pre-seeded Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Doctor | priya.sharma@mediexpress.in | doctor123 |
| Doctor | rajesh.kumar@mediexpress.in | doctor123 |
| Pharmacy | pharmacy@mediexpress.in | pharmacy123 |
| Delivery | delivery@mediexpress.in | delivery123 |
