# MediExpress

> Prescription-Based Medicine Delivery Platform with Video Consultation & Real-Time Tracking

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### For Patients
- 🩺 **Video Consultation** — Book & join video calls with real doctors
- 💊 **Medicine Shop** — Browse 100+ OTC medicines, add to cart & checkout
- 📋 **Prescriptions** — Upload prescriptions for pharmacy review
- 🗺️ **Live Tracking** — Track your delivery partner on a real-time map (Blinkit-style)
- 🤖 **Chatbot** — 24/7 help & support via MediBot

### For Doctors
- 📹 **Manage Consultations** — View & attend patient video calls
- ✍️ **Digital Prescriptions** — Write and send prescriptions directly

### For Pharmacy
- 📋 **Review Prescriptions** — Accept/reject incoming prescriptions  
- 📦 **Order Management** — Confirm → Prepare → Ready workflow with full medicine details

### For Delivery Partners
- 🚴 **Delivery Dashboard** — View assigned orders
- 📍 **Status Updates** — Mark orders as out-for-delivery → delivered

### Security
- 🔐 **Role-based login portals** — Separate login for Patient, Doctor, Pharmacy, Delivery
- 🛡️ **Route protection** — Each role can only access their own pages
- 🔑 **JWT Authentication** — Secure API with token-based auth

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas for production) |
| Maps | Leaflet.js + OpenStreetMap |
| Video | Jitsi Meet (free) |
| Auth | JWT + bcrypt |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/mediexpress.git
cd mediexpress

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development (2 terminals)
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Open http://localhost:3000

## 📦 Production Build

```bash
cd frontend && npm run build
cd ../backend && NODE_ENV=production node server.js
```

Single server at http://localhost:5001

## 🌐 Deploy to Render (Free)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo and set:
   - **Build**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start**: `cd backend && node server.js`
4. Add environment variables:
   - `MONGO_URI` = MongoDB Atlas connection string
   - `JWT_SECRET` = Any strong secret
   - `NODE_ENV` = production

## 🧪 Test Accounts (Auto-seeded)

| Role | Email | Password |
|------|-------|----------|
| Doctor | priya.sharma@mediexpress.in | doctor123 |
| Doctor | rajesh.kumar@mediexpress.in | doctor123 |
| Pharmacy | pharmacy@mediexpress.in | pharmacy123 |
| Delivery | delivery@mediexpress.in | delivery123 |

## 📸 Screenshots

### Login — Role Selection
4 separate portals for Patient, Doctor, Pharmacy, and Delivery

### Patient Dashboard
Welcome banner, doctor directory, stats, and quick actions

### Medicine Shop
100+ OTC medicines with search, category filters, cart & checkout

### Live Delivery Tracking
Blinkit-style map with animated delivery partner, route, and ETA

## 📄 License

MIT © MediExpress
