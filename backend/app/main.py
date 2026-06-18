from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app import crud, models
from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, caregiver, case_manager, village_volunteer


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS village_volunteer_profiles "
                "ALTER COLUMN license_id DROP NOT NULL"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS users "
                "ADD COLUMN IF NOT EXISTS profile_image_data TEXT"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS users "
                "ADD COLUMN IF NOT EXISTS date_of_birth DATE"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS users "
                "ADD COLUMN IF NOT EXISTS gender VARCHAR(30)"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS kids "
                "ADD COLUMN IF NOT EXISTS full_name VARCHAR(160)"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS kids "
                "ADD COLUMN IF NOT EXISTS date_of_birth DATE"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS kids "
                "ADD COLUMN IF NOT EXISTS gender VARCHAR(30)"
            )
        )
        connection.execute(
            text(
                "UPDATE kids "
                "SET full_name = 'ไม่ระบุชื่อ' "
                "WHERE full_name IS NULL"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS kids "
                "ALTER COLUMN full_name SET NOT NULL"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS caregiver_kid_assignments "
                "ADD COLUMN IF NOT EXISTS availability_slot_id UUID"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS denver_evaluations "
                "ADD COLUMN IF NOT EXISTS assignment_id UUID"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS denver_evaluations "
                "ADD COLUMN IF NOT EXISTS availability_slot_id UUID"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS denver_evaluations "
                "ADD COLUMN IF NOT EXISTS therapy_session_id UUID"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE IF EXISTS village_volunteer_kid_assignments "
                "DROP CONSTRAINT IF EXISTS village_volunteer_kid_assignments_kid_id_key"
            )
        )
        connection.execute(
            text(
                "DO $$ BEGIN "
                "IF EXISTS ("
                "SELECT 1 FROM information_schema.tables "
                "WHERE table_name = 'village_volunteer_kid_assignments'"
                ") AND NOT EXISTS ("
                "SELECT 1 FROM pg_constraint "
                "WHERE conname = 'uq_village_volunteer_kid_assignments_pair'"
                ") THEN "
                "ALTER TABLE village_volunteer_kid_assignments "
                "ADD CONSTRAINT uq_village_volunteer_kid_assignments_pair "
                "UNIQUE (kid_id, village_volunteer_id); "
                "END IF; END $$;"
            )
        )
    settings = get_settings()
    if settings.first_admin_thai_id and settings.first_admin_password:
        with SessionLocal() as db:
            existing_admin = crud.get_user_by_thai_id(db, settings.first_admin_thai_id)
            if existing_admin is None:
                crud.create_admin(
                    db,
                    settings.first_admin_thai_id,
                    settings.first_admin_password,
                )
    yield


settings = get_settings()

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(case_manager.router, prefix="/api/v1")
app.include_router(caregiver.router, prefix="/api/v1")
app.include_router(village_volunteer.router, prefix="/api/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Welcome to ot@home API"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
