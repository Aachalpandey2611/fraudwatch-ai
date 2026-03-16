# MongoDB Compass and mongosh – edit data and see it in the frontend

## Servers (already running)

- **Backend:** http://localhost:5000  
- **Frontend:** http://localhost:5173 — open this in your browser and log in (e.g. **admin** / **FwAdmin#Demo24**).

MongoDB must be running (e.g. Docker: `docker start frauddetection-mongo` or your local MongoDB).

---

## 1. Download MongoDB Compass (GUI)

1. Go to: **https://www.mongodb.com/try/download/compass**
2. Download **MongoDB Compass** for your OS and install it.
3. Open Compass. In the connection box, enter: **`mongodb://localhost:27017`** and click **Connect**.
4. In the left sidebar, open the database **`fraud_warning_system`**.
5. Open the collections **`activitylogs`** and **`alerts`**.
6. Edit or add documents there (e.g. change `employeeName`, `riskScore`, `actionType`, `timestamp`).
7. In the **frontend** (http://localhost:5173), go to the Dashboard and click **"Refresh data"** — you’ll see the updated data in the Anomaly Timeline and stats.

---

## 2. mongosh (CLI, if installed)

If you have **mongosh** (e.g. from MongoDB install or `brew install mongosh`):

```bash
mongosh
```

Then:

```bash
use fraud_warning_system
db.activitylogs.find().pretty()
db.activitylogs.updateOne({ employeeName: "Marcus Thompson" }, { $set: { riskScore: 95 } })
db.alerts.updateOne({ employeeName: "Marcus Thompson" }, { $set: { riskScore: 95 } })
```

After editing, click **"Refresh data"** on the frontend Dashboard to see the changes.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Download Compass from https://www.mongodb.com/try/download/compass and install |
| 2 | Open Compass → connect to `mongodb://localhost:27017` |
| 3 | Open database `fraud_warning_system` → collections `activitylogs` and `alerts` |
| 4 | Edit or add documents in Compass (or use mongosh) |
| 5 | Open frontend http://localhost:5173, log in, click **Refresh data** on the Dashboard to see changes |
