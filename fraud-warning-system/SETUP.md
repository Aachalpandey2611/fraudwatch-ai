# Fraud Warning System – Setup (Database & Live Data)

To connect to the database and see **dynamic data** in the frontend:

## 1. Install and start MongoDB

**Option A – Install MongoDB locally (macOS with Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Or run once: `mongod` (uses data in `/usr/local/var/mongodb` by default).

**Option B – MongoDB via Docker (no Homebrew install):**

```bash
docker run -d --name frauddetection-mongo -p 27017:27017 mongo:latest
```

Then use `mongodb://localhost:27017` (default); no `.env` change needed. To stop: `docker stop frauddetection-mongo`. To start again: `docker start frauddetection-mongo`.

**Option C – MongoDB Atlas (cloud, no local install):**

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Get the connection string and set it in `fraud-warning-system/backend/.env`:
   ```bash
   MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/fraud_warning_system
   ```

**Then:** Ensure MongoDB is running (local or Atlas) so the backend can connect.

## 2. Backend environment (optional)

From `fraud-warning-system/backend`:

```bash
cp .env.example .env
# Edit .env if needed (MONGO_URI, JWT_SECRET). Defaults work for local MongoDB.
```

## 3. Seed the dummy data (optional)

Load the 5 dummy alerts so the dashboard shows:

- Marcus Thompson 96% bulk download (1h ago)
- David Chen 88% privilege escalation (3h ago)
- Lisa Rodriguez 79% account modification (5h ago)
- Ahmed Hassan 72% transaction (8h ago)
- James Okafor 83% report generation (6h ago)

From `fraud-warning-system/backend`:

```bash
npm run seed:dummy
```

You should see: `Seeded 5 alerts/activities` and a list of names.

## 4. Start the backend

```bash
cd fraud-warning-system/backend
npm install
npm start
# or: node server.js
```

You should see: `MongoDB Connected: ...`

## 5. Start the frontend

```bash
cd fraud-warning-system/frontend
npm install
npm run dev
```

Open the app (e.g. http://localhost:5173).

## 6. Log in

Live data is only shown when you are **logged in**. Use a demo account:

- **Username:** `admin` · **Password:** `FwAdmin#Demo24`
- Or: `analyst` / `FwAnalyst#Demo24` · `investigator` / `FwInvest#Demo24`

After login, Dashboard and Activities will load data from MongoDB. If you see “Showing demo data” and a yellow banner, either the backend/MongoDB is not running or you are not logged in.

---

## Data source: MongoDB only

**MongoDB is the only data source.** Edit data directly in MongoDB (Compass or mongosh); the frontend fetches from the backend, which reads from MongoDB. After editing, click **"Refresh data"** on the Dashboard to see changes.

Data is stored in the database `fraud_warning_system` (or the DB name in your `MONGO_URI`). Collections:

- **activitylogs** – each row is an activity (employeeName, riskScore, actionType, timestamp, etc.).
- **alerts** – each row is an alert (same fields; the Alerts page reads from here).

**Ways to edit:**

1. **MongoDB Compass (GUI)**  
   - Download: [mongodb.com/products/compass](https://www.mongodb.com/products/compass).  
   - Connect to `mongodb://localhost:27017` (or your Atlas URI).  
   - Open database `fraud_warning_system` → collections `activitylogs` and `alerts`.  
   - Edit documents or add new ones. Use the same field names as in the seed script (e.g. `employeeName`, `riskScore`, `actionType`, `timestamp`).  
   - Refresh the frontend (or reload the page); the app fetches from the API, so changes appear after reload.

2. **mongosh (CLI)**  
   ```bash
   mongosh
   use fraud_warning_system
   db.activitylogs.find().pretty()
   db.activitylogs.updateOne({ employeeName: "Marcus Thompson" }, { $set: { riskScore: 90 } })
   db.alerts.updateOne({ employeeName: "Marcus Thompson" }, { $set: { riskScore: 90 } })
   ```

3. **Add new data**  
   - In Compass or mongosh: insert a new document into `activitylogs` and (if it should show as an alert) into `alerts`.  
   - Required fields for **activitylogs**: `userId`, `employeeName`, `employeeId`, `department`, `role`, `actionType`, `systemAccessed`, `riskScore`, `timestamp`. Use `actionType` from: `login`, `transaction`, `data_access`, `bulk_download`, `account_modification`, `privilege_escalation`, `report_generation`, `customer_lookup`.  
   - For **alerts**: same plus `activityType` (same values as `actionType`), `status` (e.g. `"open"`).

After any change, click **"Refresh data"** on the Dashboard (or reload the page) to see the updated data in the Anomaly Timeline and stats.
