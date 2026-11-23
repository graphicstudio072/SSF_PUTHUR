# SSF PUTHUR SECTOR | Event Registration & Attendance Portal

A production-ready full-stack web application built on the **MERN Stack** (MongoDB, Express.js, React, Node.js) for **SSF PUTHUR SECTOR** with a clean White & Green theme, modeled after the visual polish, mobile-first responsiveness, and user experience of `https://ssfputhur.netlify.app`.

---

## 🌟 Key Features

### 1. Strict Routing & Access Separation
- **Public Candidate Portal (`/`)**:
  - Pure public registration page with **zero** admin links, buttons, badges, or hidden clues.
  - Candidate registration with Name, 10-digit Mobile Number, and dynamic Unit dropdown.
  - Instant ticket generation with Unique Ticket ID (`SSF-PUT-XXXXXX`) and live QR code.
  - "Download Ticket (PNG)", "Print Ticket", and "Share on WhatsApp" options.
  - Fast ticket retrieval for already registered candidates.
- **Dedicated Admin Portal (`/admin`)**:
  - Accessible strictly at `/admin` and protected by a secure numeric PIN lock verified via the backend API.
  - **"Copy Admin Link"** button on the dashboard for instant sharing by the admin.
  - Secure session token (JWT) management with auto-lock.

### 2. Sector 7 Units Management
- Pre-seeded with the 7 units of SSF Puthur Sector:
  1. *Puthur Town (PT-01)*
  2. *Parladka (PT-02)*
  3. *Kombam (PT-03)*
  4. *Mukve (PT-04)*
  5. *Kemminje (PT-05)*
  6. *Bannur (PT-06)*
  7. *Mottethadka (PT-07)*
- Full CRUD: Add new units, edit unit names/codes, delete units. Changes sync live with the candidate registration dropdown.

### 3. Live QR Scanner & Gate Check-In
- Camera-based live QR code scanner powered by `html5-qrcode`.
- Manual Ticket ID fallback input.
- Real-time candidate card verification display.
- **Duplicate Prevention Warning**: Clear alert displaying previous verification timestamp if a ticket is scanned more than once.
- Audible chime feedback on successful check-in and warning buzz on duplicates.

### 4. Unit-Wise Attendance & WhatsApp Reports
- Overall sector attendance metrics (Total Registered, Total Attended, Attendance Rate %).
- **Unit Selector**: View individual unit attendees and broadcast that single unit's report to WhatsApp (`https://wa.me/?text=...`) with a "Copy Text" button.
- **Full Sector Attendance Report**: Broadcast complete 7-unit summary and statistics to WhatsApp with a "Copy Report" button.

### 5. Logo, Theme & Poster Settings
- Upload & customize **Website Logo** (updates header, tickets, and branding).
- Upload & customize **Event Poster** (displayed on tickets and registration page).
- Live editing of Event Name, Date, Time, Venue, and Motto.
- Color theme switcher (Classic White & Green, Deep Emerald, Forest Green, Teal Mint).
- Admin PIN change interface.

---

## 📁 Project Structure

```
puthur sector/
├── package.json              # Root build & start scripts (Render unified deploy)
├── render.yaml               # 1-Click Render Blueprint configuration
├── DEPLOYMENT.md             # Complete step-by-step Git & Render guide
├── README.md                 # Project overview and instructions
├── .gitignore                # Git ignore for node_modules, env, and uploads
├── server/
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Local environment file
│   ├── package.json          # Express, Mongoose, Multer, JWT
│   ├── server.js             # Server entry point & static SPA fallback
│   ├── config/
│   │   └── db.js             # MongoDB connection with in-memory fallback
│   ├── models/
│   │   ├── Candidate.js      # Candidate registration schema
│   │   ├── Unit.js           # 7 Sector Units schema
│   │   └── Setting.js        # Branding, event, theme & PIN schema
│   ├── controllers/
│   │   ├── authController.js # PIN verification, JWT, change PIN
│   │   ├── candidateController.js # Register, check-in, statistics
│   │   ├── unitController.js # Units CRUD
│   │   └── settingController.js # Settings & file uploads
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT Bearer authorization
│   │   └── uploadMiddleware.js # Multer file upload handler
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth
│   │   ├── candidateRoutes.js # /api/candidates
│   │   ├── unitRoutes.js     # /api/units
│   │   └── settingRoutes.js  # /api/settings
│   ├── utils/
│   │   └── seedData.js       # Auto-seeds 7 units & default settings
│   └── uploads/              # Static uploads folder for logos & posters
└── client/
    ├── .env.example
    ├── .env
    ├── package.json          # React, Vite, Tailwind CSS, Lucide, HTML5-QRCode
    ├── vite.config.js        # Vite config with API proxy
    ├── tailwind.config.js    # White & Green theme color definitions
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── App.jsx           # Clean routing (/ and /admin)
        ├── main.jsx
        ├── index.css
        ├── context/
        │   └── SettingsContext.jsx # Global branding & theme state
        ├── components/
        │   ├── Header.jsx    # Public branding (Zero admin clue)
        │   ├── Footer.jsx    # Public footer
        │   ├── TicketCard.jsx # Premium event pass with QR code
        │   ├── TicketModal.jsx # Pass view, download & WhatsApp share
        │   └── PinModal.jsx   # /admin PIN keypad & unlock gate
        ├── pages/
        │   ├── RegisterPage.jsx # Public registration route (/)
        │   └── AdminDashboardPage.jsx # Dedicated Admin route (/admin)
        ├── tabs/
        │   ├── UnitsManagementTab.jsx
        │   ├── QrCheckInTab.jsx
        │   ├── AttendanceReportTab.jsx
        │   ├── CandidatesListTab.jsx
        │   └── SettingsTab.jsx
        └── utils/
            ├── api.js        # Centralized REST API calls & auth token
            └── ticketDownload.js # PNG download & print helpers
```

---

## 🚀 Running Locally

### Prerequisites
- **Node.js**: v18+ (Node v20+ recommended)
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI

### 1. Start Server
```bash
cd server
npm install
npm run dev
```
The server runs on `http://localhost:5000` and automatically seeds the 7 units and default settings.

### 2. Start Client
Open another terminal:
```bash
cd client
npm install
npm run dev
```
The client runs on `http://localhost:5173`.

---

## 🔒 Default Admin Credentials (Local Testing)
- **Admin Route**: `http://localhost:5173/admin`
- **Default PIN**: `7860` (or configured via `ADMIN_PIN` in `server/.env`)

---

## ☁️ Deploying to Render with Git
See the detailed guide in [DEPLOYMENT.md](file:///c:/Users/91974/OneDrive/Pictures/puthur%20sector/DEPLOYMENT.md).
