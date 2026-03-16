# Deploy FraudWatch (Frontend + Backend + ML) on Render

This project is prepared for one-click Render Blueprint deploy via `render.yaml`.

## 1) Push project to GitHub

Render deploys from a Git repository.

## 2) Create MongoDB Atlas database

Create an Atlas cluster and copy the connection string.
You will set it as `MONGO_URI` in Render.

## 3) Deploy Blueprint

1. Open Render dashboard
2. New + -> Blueprint
3. Select your GitHub repo
4. Use `fraud-warning-system/render.yaml`

Render will create:

- `fraudwatch-ml` (Python Flask)
- `fraudwatch-backend` (Node/Express)
- `fraudwatch-frontend` (Static Vite)

## 4) Set required secrets in Render

For `fraudwatch-backend` service:

- `MONGO_URI` = your Atlas URI
- `JWT_SECRET` = a strong random string

Other service URLs are auto-wired by blueprint env mappings.

## 5) Verify health

- Backend health: `https://<backend-url>/api/health`
- ML health: `https://<ml-url>/health`
- Frontend: `https://<frontend-url>`

## 6) Bootstrap users (one time)

Open Render backend shell and run:

```bash
npm run bootstrap:users
npm run bootstrap:employees
```

## 7) Login

- Admin route: `/admin/login`
- Employee route: `/employee/login`

## Notes

- Frontend uses `VITE_API_URL` and `VITE_SOCKET_URL` (set by blueprint).
- Backend uses `ML_SERVICE_URL` and `CLIENT_URLS` (set by blueprint).
- ML service reads Render `PORT` automatically.
