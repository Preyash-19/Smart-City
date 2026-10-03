# 🏙️ Smart City Management Platform

An intelligent, full-stack municipal issue reporting, classification, and resolution platform with an integrated AI Engine.

---

## 🌟 Architecture Overview

The system is organized into three major services:

1. **Frontend (`/frontend`)**
   - Built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.
   - Progressive Web App (PWA) ready with offline detection & real-time notifications.
   - Comprehensive Citizen & Municipal Admin Dashboards, complaint reporting, and tracking.

2. **Backend (`/backend`)**
   - Built with **Node.js**, **Express**, and **Prisma ORM**.
   - RESTful API handling authentication, role-based authorization, complaints lifecycle, and notifications.
   - Configured with SQLite / PostgreSQL (Prisma).

3. **AI Engine (`/ai-engine`)**
   - Built with **FastAPI (Python)**.
   - Real-time automated complaint classification:
     - **Department Classification** (Sanitation, Drainage, Water Supply, Electrical, Traffic, Road, General).
     - **Priority Scoring** (Low, Medium, High) based on risk factors and safety urgency.
     - **Evidence Analysis & Anti-Spam / Validity Check**.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. AI Engine Setup
```bash
cd ai-engine
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
pip install fastapi uvicorn pydantic
python main.py
```

---

## 🔒 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:
```env
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="your_jwt_secret_key"
```

---

## 📄 License
MIT License.
