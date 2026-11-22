# DigiVahivat Web (React + Vite + Tailwind CSS)

**DigiVahivat** is a modern Digital Society Governance, Financial Transparency, and Gate Security Management Web Platform, built to complement and extend the **DigiVahivat (Falo)** mobile app and Express/MongoDB backend.

---

## 🌟 Core Portals & Capabilities

### 1. Public Portal & Visitor Pass
- **Landing Page (`/`)**: Product showcase, features overview, demo credentials, and direct links to all modules.
- **Digital Gate Pass (`/pass/:id`)**: Public link & QR code pass for expected visitors, cab drivers, and delivery agents. Shows live status (`PreApproved`, `Inside`, `Exited`, `Cancelled`, `Expired`), host flat details, and 6-digit passcode.
- **Legal & Support (`/privacy`, `/terms`, `/support`)**: Privacy policy, terms of service, and direct support ticket submission.

### 2. Platform SuperAdmin Console (`/superadmin`)
- **Global Health & KPIs**: Total registered societies, active communities, total residents, system uptime.
- **Societies Management (`/superadmin/societies`)**: Create new societies, edit details, toggle active/inactive status, delete society.
- **Committee Admin Provisioning**: Assign and manage administrators for each individual society.

### 3. Society Administrator ERP (`/admin`)
- **Executive Dashboard (`/admin`)**: Real-time financial summary (Total Collection, Total Expenses, Net Fund Balance), active event progress gauge, quick action buttons, and recent transaction audit ledger.
- **Events & Falo Management (`/admin/events`)**: Create/edit society events (Navratri, Diwali, Capital Overhauls), define target budgets and per-flat quotas, track collections, and export 1-click Excel financial audit sheets (`.xlsx`).
- **Payment Collection (`/admin/collect`)**: Record resident contributions with searchable resident picker, Cash/UPI toggles, UTR reference tracking, celebration confetti, and instant PDF receipt generation.
- **Maintenance Fund Tracker (`/admin/maintenance`)**: Track annual maintenance dues by flat and fiscal year (2026, 2025, 2024), filter Paid and Pending flats, and 1-tap collect maintenance modal.
- **Expense Ledger (`/admin/expenses`)**: Log society expenditures with categories (Sound, Catering, Electrical, Plumbing, Cleaning, etc.), upload receipt/invoice photos, and committee approval workflows.
- **Resident Directory (`/admin/residents`)**: Flat-by-flat directory with phone numbers, family member counts, and roles (Resident, Admin, Guard).
- **Gate Security & VMS (`/admin/visitors`)**: Monitor expected visitors, active "Inside Now" register with 1-tap checkout, and 6-digit passcode / QR verification modal.
- **Helpdesk & Complaints (`/admin/complaints`)**: Review member service requests, filter by priority and category, update statuses, and log resolution remarks.
- **Notice Board (`/admin/notices`)**: Publish official society circulars, pin important alerts, and categorize announcements.
- **Emergency SOS Console (`/admin/sos`)**: Crisis command center with audio-visual alarms, response acknowledgement, and resolution reporting.

### 4. Resident Member Portal (`/resident`)
- **Member Dashboard (`/resident`)**: Active society event progress, personal flat payment status, recent notices, emergency contact directory, and 1-tap SOS trigger.
- **My Contributions (`/resident/payments`)**: Personal contribution history, printable and downloadable digital vouchers with verification stamps.
- **My Visitors (`/resident/visitors`)**: Pre-approve guests, cabs, or couriers with 6-digit passcodes, dynamic QR codes, WhatsApp share links, and cancel pass options.
- **Helpdesk & Service Requests (`/resident/complaints`)**: Submit maintenance issues to the committee and track resolution progress.
- **Society Expenditure Feed (`/resident/expenses`)**: Full financial transparency into society funds and receipts.
- **Notice Board (`/resident/notices`)**: View society circulars and guidelines.

### 5. Security Guard Gate Terminal (`/guard`)
- **Touch-Friendly Gate Console (`/guard`)**: Large-format numeric keypad for rapid 6-digit passcode verification, 1-tap gate entry check-in, real-time "Inside Now" visitor table, and 1-tap exit checkout.
- **Live SOS Monitor (`/guard/sos`)**: Immediate audible & visual siren banner with host flat phone number.

---

## 🚀 Running the Web Application

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Development Server
```bash
cd digivahivatWeb
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
cd digivahivatWeb
npm run build
npm run preview
```

---

## 🔑 Quick Demo Credentials

| Role | Mobile Number | Password | Portal Route |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | `9876543210` | `Admin@1234` | `/superadmin` |
| **Society Admin** | `9876543210` | `Admin@1234` | `/admin` |
| **Resident** | `9876543211` | `User@1234` | `/resident` |
| **Security Guard** | `9876543212` | `Guard@1234` | `/guard` |

> **Note:** If testing with a freshly deployed or local database, click the **"Initialize Seed Admin"** button on the Login page (`/login`) to automatically provision the default SuperAdmin credentials.

---

## ⚙️ Backend API Configuration (.env)
The frontend connects to the backend through the `VITE_API_BASE_URL` environment variable.

Configure `.env` in `digivahivatWeb`:
```bash
# Production deployed backend (default)
VITE_API_BASE_URL=https://digivahivatbackend.onrender.com/api

# Or local backend when developing locally:
# VITE_API_BASE_URL=http://localhost:5000/api
```
