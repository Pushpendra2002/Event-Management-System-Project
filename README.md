# 🎟️ EventPulse — Event Management System

A full-stack, enterprise-ready **MERN (MongoDB, Express, React, Node.js)** Event Management and Ticketing Platform. Designed for seamless event discovery, automated digital boarding passes with QR codes, dedicated organizer analytics studios, and administrator moderation.

![EventPulse Platform](https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Highlights & Features

### 👤 Role-Based Experience
- **Attendees**: Discover local and online events, filter by category/price, book tickets, view perforated digital boarding passes with instant QR codes, and track order histories.
- **Organizers**: Dedicated **Organizer Studio** to publish events via a 4-step wizard with live sticky preview, manage capacities, track real-time revenue and attendee metrics.
- **Administrators**: Centralized **Admin Center** with 7D/30D/1Y revenue analytics, platform-wide user and event status controls, and action confirmation modals.

### 🎟️ Smart Ticketing & QR Code Passes
- **Perforated Digital Pass**: Boarding-pass aesthetic with dynamic ticket barcodes and live venue directions.
- **Prominent QR Code Stubs**: Scan-ready SVG QR codes embedded with cryptographic ticket IDs for rapid venue check-in.
- **Indian Rupee (₹ - INR)**: Consistent INR currency formatting (`formatCurrency`) across bookings, ticket tiers, and revenue dashboards.

### 🔍 Discovery & Live Filters
- **Hero Search Bar**: Instant title and description query matching.
- **Category Pills**: 15 custom event categories (Music, Technology, Sports, Workshops, Conferences, etc.).
- **Active Filter Chips**: Dismissible chips for quick tag, price (Free vs. Paid), and status clearing.
- **Skeleton Shimmer Loading**: Polished `placeholder-glow` placeholders for zero layout shifts.

### 🔔 Live Notification Center
- Real-time dropdown alerts for booking confirmations, event updates, and cancellations.
- Unread badge counters (`9+`), "Mark all as read" shortcut, and tabbed notification view.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Redux Toolkit, React Router 7, React Bootstrap 5, Lucide Icons, QRCode.react, Formik & Yup, Moment.js |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose 9, JWT Authentication, bcryptjs, Helmet, Express Rate Limit, Multer |
| **Integrations** | Cloudinary (Image storage), Stripe (Payment processing), Socket.IO (Real-time updates) |
| **DevOps & QA** | Jest, React Testing Library, ESLint, Postman / Node QA Test Suite |

---

## 📁 Repository Structure

```
event-management-system/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Route controllers (auth, events, bookings, admin, etc.)
│   ├── middleware/         # Auth verification, role guards, file upload, error handling
│   ├── models/             # Mongoose schemas (User, Event, Booking, Notification)
│   ├── routes/             # Express API routers (/api/v1/...)
│   ├── utils/              # Token generators, Cloudinary, email & socket helpers
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Backend dependencies & scripts
│   └── server.js           # Server entry point
│
├── frontend/
│   ├── public/             # Static assets & HTML template
│   ├── src/
│   │   ├── app/            # Redux store configuration
│   │   ├── components/     # UI components (Auth, Events, Layout, Routes)
│   │   ├── features/       # Redux slices (auth, events, bookings, notifications)
│   │   ├── pages/          # Application views (Home, Discovery, Studio, Admin, Profile)
│   │   ├── services/       # Axios API client & interceptors
│   │   ├── utils/          # Currency formatters, socket client, auth tokens
│   │   ├── App.js          # Route declarations
│   │   └── index.js        # React DOM render entry
│   ├── .env.example        # Frontend environment variables template
│   └── package.json        # Frontend dependencies & scripts
│
├── .gitignore              # Monorepo-wide git exclusion rules
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance on `127.0.0.1:27017` or a MongoDB Atlas URI)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Pushpendra2002/Event-Management-System-Project.git
cd Event-Management-System-Project
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
npm install
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/event_management
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
RATE_LIMIT_MAX=5000
```

### 3. Configure Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

### 4. Run Locally

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

---

## 🚢 Deployment Guide

### Option A: Deploying Backend on Render / Railway
1. Push this repository to GitHub.
2. Sign up on [Render](https://render.com) or [Railway](https://railway.app).
3. Create a **New Web Service** pointing to your repository.
4. Set the **Root Directory** to `backend`.
5. Set Build Command: `npm install`
6. Set Start Command: `node server.js`
7. In the **Environment Variables** tab, add:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI` (from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
   - `FRONTEND_URL` (your deployed Vercel domain)
   - `JWT_SECRET` (secure random string)

### Option B: Deploying Frontend on Vercel
1. Sign up on [Vercel](https://vercel.com).
2. Click **Add New Project** and import `Event-Management-System-Project`.
3. Set **Framework Preset**: Create React App.
4. Set **Root Directory**: `frontend`.
5. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = `https://your-backend-service.onrender.com/api/v1`
6. Click **Deploy**.

---

## 🛡️ License & Author
- **Author**: [Pushpendra2002](https://github.com/Pushpendra2002)
- **License**: MIT
