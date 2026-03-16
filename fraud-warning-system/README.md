# FraudWatch AI — Early Warning System for Internal & Privileged User Fraud

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.9+
- npm or yarn

---

## 1. Start MongoDB

```bash
# Local MongoDB
mongod --dbpath /data/db

# Or use MongoDB Atlas (update MONGO_URI in backend/.env)
```

---

## 2. Setup Backend

```bash
cd fraud-warning-system/backend

# Install dependencies
npm install

# Start server (nodemon)
npm run server

# OR plain node
npm start
```

Backend runs on: http://localhost:5000

---

## 3. Seed Database with Mock Data

```bash
# From backend folder (after server is running):
npm run seed

# This generates 180 activity logs and alerts
```

---

## 4. Setup ML Service

```bash
cd fraud-warning-system/ml-service

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start ML Flask service
python app.py
```

ML service runs on: http://localhost:5001

---

## 5. Setup Frontend

```bash
cd fraud-warning-system/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Portal Login Credentials

Run backend bootstrap once to create default users:

```bash
cd backend
npm run bootstrap:users
```

| Portal   | Login ID               | Password     | Frontend Route  |
| -------- | ---------------------- | ------------ | --------------- |
| Admin    | admin@fraudwatch.local | Admin@123    | /admin/login    |
| Employee | employee1@bank.local   | Employee@123 | /employee/login |

---

## Architecture

```
Frontend (React + Vite)
    |
    | HTTP REST APIs + Socket.io
    |
Backend (Node.js + Express)
    |           |
    |           | HTTP (axios)
    |           |
MongoDB    ML Service (Flask)
           Isolation Forest
```

---

## Key Features

### Dashboard

- Real-time stat cards: employees monitored, total alerts, high-risk users, anomalies today
- Risk score distribution chart
- Department anomaly chart
- Fraud anomaly timeline
- Behavior baseline panel comparing normal vs current activity
- AI Risk explanation panel with weighted reasons
- Employee-Account network graph (SVG-based)
- Live updates from real activities and generated alerts (no frontend dummy dataset)

### Alerts Page

- Full sortable/filterable alert table
- Severity badges (Critical, High, Medium, Low)
- Click any alert to open detailed investigation drawer
- Update alert status inline
- Real-time new alerts via Socket.io

### Activities Page

- Complete employee activity log
- Filters: department, action type, risk level
- Color-coded risk indicators
- Anomaly highlighting

### Investigation Center

- Case management (Open → Investigating → Resolved)
- Assign investigators
- Add case notes
- Mark as False Positive
- AI fraud indicators panel

### Settings

- Configurable ML threshold slider
- Detection sensitivity selector
- Alert notification settings
- Data retention controls
- System status panel

---

## ML Service Details

- **Algorithm**: Isolation Forest (scikit-learn)
- **Features**: Hour of day, day of week, data volume, transaction amount, accounts accessed, session duration, action type, department, is_weekend, is_after_hours
- **Contamination**: 8% (tuned for banking fraud rates)
- **Scoring Source**: ML service output is used for risk scoring

---

## API Reference

| Method | Endpoint                 | Description                              |
| ------ | ------------------------ | ---------------------------------------- |
| POST   | /api/auth/admin-login    | Admin authentication                     |
| POST   | /api/auth/employee-login | Employee authentication                  |
| GET    | /api/activities          | Admin: get activity logs (with filters)  |
| POST   | /api/activities          | Employee: log new activity (triggers ML) |
| GET    | /api/activities/stats    | Admin dashboard statistics               |
| GET    | /api/alerts              | Admin: get alerts                        |
| PUT    | /api/alerts/:id          | Admin: update alert status               |
| POST   | /api/ml/analyze          | Authenticated ML analysis                |
| GET    | /api/ml/config           | Admin: get ML/risk config                |
| PUT    | /api/ml/config           | Admin: update ML/risk config             |

---

## Real-Time Flow

1. Employee activity logged via POST /api/activities
2. Backend calls ML service: POST http://localhost:5001/analyze
3. ML returns `{ riskScore, isAnomaly, reasons }`
4. If anomaly detected → Alert created in MongoDB
5. Alert emitted via Socket.io → Frontend receives instantly
6. Toast notification appears + notification bell updates
