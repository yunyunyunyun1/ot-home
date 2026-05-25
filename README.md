# ot@home

Backend starter for `ot@home` using FastAPI and PostgreSQL.

## Prerequisites

- Docker Desktop
- WSL terminal recommended. If `wsl` says there are no installed distributions, install one first:

```powershell
wsl --install -d Ubuntu
```

Then restart your terminal and open Ubuntu from the Start menu.

## Run The Backend

### Option 1: Docker For API And Database

From the project root:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

If your Docker installation uses the standalone Compose command, use:

```bash
docker-compose up --build
```

### Option 2: Venv For API, Docker For Database

From the project root, start only PostgreSQL:

```powershell
docker-compose up -d db
```

Then from `backend`, use the local `.env` file with `localhost`:

```env
DATABASE_URL=postgresql+psycopg://ot_user:ot_password@localhost:5432/ot_at_home
```

Run FastAPI through the venv:

```powershell
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API will be available at:

- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Example CRUD Routes

## Authentication Routes

The backend includes registration and login for the first user roles:

- `POST /api/v1/auth/register/parent`
- `POST /api/v1/auth/register/caregiver`
- `POST /api/v1/auth/register/village-volunteer`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Case managers are admin-created only:

- `POST /api/v1/auth/admin/case-managers`

For local development, create a first admin by setting these in `backend/.env`, then restart the API:

```env
FIRST_ADMIN_THAI_ID=1234567890123
FIRST_ADMIN_PASSWORD=StrongAdminPass1!
```

Thai ID is stored as a unique string, not a primary key. API responses return a masked Thai ID.
