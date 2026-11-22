# DigiVahivat (દીગીવહીવટ)

> **All-in-One Digital Society Governance, Financial Transparency, and Security Management Platform**

This repository contains the complete ecosystem for **DigiVahivat**, comprising the backend REST API, the responsive web management portal, and the cross-platform mobile application.

---

## 📁 Repository Structure

```text
DigiVahivat/
├── digivahivatBackend/    # Node.js + Express.js + MongoDB REST API backend
├── digivahivatWeb/        # React 19 + Vite 8 + Tailwind CSS v4 responsive web portal
└── digivahivatApp/        # React Native / Expo cross-platform mobile application
```

---

## 🚀 Projects Overview & Setup

### 1. Backend (`digivahivatBackend`)
- **Stack**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt
- **Features**: Authentication, Resident management, Event collections (Falo), Expense ledger, Maintenance dues, Visitor management, Emergency SOS
- **Setup**:
  ```bash
  cd digivahivatBackend
  npm install
  cp .env.example .env     # Configure PORT, MONGO_URI, JWT_SECRET
  npm run dev
  ```
- **Deployment (e.g. Render / Railway)**:
  - **Root Directory**: `digivahivatBackend`
  - **Build Command**: `npm install`
  - **Start Command**: `node server.js` (or `npm start`)

### 2. Web Portal (`digivahivatWeb`)
- **Stack**: React 19, Vite 8, Tailwind CSS v4, Lucide Icons, Axios, Canvas Confetti
- **Portals**:
  - **SuperAdmin**: Platform health, society provisioning, admin assignment
  - **Society Admin**: Executive financial dashboard, event collections, maintenance ledger, complaints helpdesk, gate logs
  - **Resident**: Event contributions, printable digital receipts, visitor pre-approvals, complaint filing
  - **Guard**: Passcode keypad verification, live visitor logs, active SOS siren monitor
- **Setup**:
  ```bash
  cd digivahivatWeb
  npm install
  cp .env.example .env     # Sets VITE_API_BASE_URL
  npm run dev
  ```
- **Deployment (e.g. Vercel / Netlify)**:
  - **Root Directory**: `digivahivatWeb`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Environment Variable**: `VITE_API_BASE_URL=https://your-backend-api.com/api`

### 3. Mobile Application (`digivahivatApp`)
- **Stack**: React Native, Expo, React Navigation
- **Setup**:
  ```bash
  cd digivahivatApp
  npm install
  npx expo start
  ```

---

## 📄 License
ISC
