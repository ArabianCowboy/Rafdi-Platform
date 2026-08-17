# Rafdi Platform

Marketplace for warehouse owners and renters: accounts, listings, bookings, Moyasar payments, admin, and notifications.

Arabic RTL UI. API is FastAPI; frontend is React + Vite.

## Layout

- `backend/` — FastAPI app (`app.main:app`)
- `frontend/` — Vite SPA
- `docker-compose.yml` — API + frontend + MySQL (optional; Docker is not required)

## Local run (no Docker)

You need **Python 3.11+** and **Node 20+**. MySQL is optional; SQLite is the default in `.env.example`.

### 1. Environment files

```powershell
copy .env.example .env
copy frontend\.env.example frontend\.env
```

Set `SECRET_KEY` in `.env` to a long random string. Leave `DATABASE_URL=sqlite:///./rafdi.db` for a first boot.

To use a local MySQL database instead:

```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@127.0.0.1:3306/rafdi
```

Create the `rafdi` database first. Tables are created on API startup (`create_all`).

### 2. API

From `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Docs: http://127.0.0.1:8000/docs

The SQLite file `rafdi.db` is created in `backend/` when you use the example `DATABASE_URL`.

### 3. Frontend

From `frontend/`:

```powershell
npm install
npm run dev
```

App: http://localhost:5173  
It calls `VITE_API_URL` (default `http://localhost:8000`).

### 4. Optional features

| Feature | Env |
|---|---|
| Card payments | `VITE_MOYASAR_KEY` in `frontend/.env` |
| Warehouse image upload | `VITE_CLOUDINARY_CLOUD` and `VITE_CLOUDINARY_PRESET` |
| Forgot-password email | `RESEND_API_KEY` and `FROM_EMAIL` |

Restart Vite after changing `VITE_*` variables.

Auth, warehouses, and bookings work without Moyasar or Cloudinary. The payment form does not load until `VITE_MOYASAR_KEY` is set.

## Docker (later)

Copy `.env.example` to `.env`, set `SECRET_KEY` and `MYSQL_ROOT_PASSWORD`, then:

```powershell
docker compose up --build
```

Compose wires the API to MySQL inside the stack. It does not use the SQLite URL from `.env`.

## Environment reference

| Variable | Where | Required |
|---|---|---|
| `DATABASE_URL` or `MYSQL_URL` | backend | yes |
| `SECRET_KEY` | backend | yes |
| `RESEND_API_KEY` / `FROM_EMAIL` | backend | no |
| `MYSQL_ROOT_PASSWORD` / `MYSQL_DATABASE` | Compose | for Docker |
| `VITE_API_URL` | frontend | no (defaults to localhost) |
| `VITE_MOYASAR_KEY` | frontend | for payments |
| `VITE_CLOUDINARY_CLOUD` / `VITE_CLOUDINARY_PRESET` | frontend | for image upload |
