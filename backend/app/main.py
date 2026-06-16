from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app import crud, models
from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, caregiver, case_manager


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
                "ALTER TABLE IF EXISTS kids "
                "ADD COLUMN IF NOT EXISTS full_name VARCHAR(160)"
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


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Welcome to ot@home API"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
