from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.security import create_access_token, get_current_user, require_admin, verify_password
from app.serializers import user_to_read

router = APIRouter(prefix="/auth", tags=["auth"])


def _raise_duplicate_user() -> None:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="A user with that Thai ID or license already exists",
    )


def _authenticate_user(db: Session, thai_id: str, password: str) -> models.User:
    user = crud.get_user_by_thai_id(db, thai_id)
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Thai ID or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    return user


@router.post("/register/parent", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register_parent(user_in: schemas.ParentRegister, db: Session = Depends(get_db)):
    if crud.get_user_by_thai_id(db, user_in.thai_id):
        _raise_duplicate_user()
    try:
        user = crud.create_parent(db, user_in)
    except IntegrityError:
        db.rollback()
        _raise_duplicate_user()
    return user_to_read(user)


@router.post(
    "/register/caregiver",
    response_model=schemas.UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register_caregiver(user_in: schemas.ProfessionalRegister, db: Session = Depends(get_db)):
    if crud.get_user_by_thai_id(db, user_in.thai_id):
        _raise_duplicate_user()
    try:
        user = crud.create_caregiver(db, user_in)
    except IntegrityError:
        db.rollback()
        _raise_duplicate_user()
    return user_to_read(user)


@router.post(
    "/register/village-volunteer",
    response_model=schemas.UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register_village_volunteer(
    user_in: schemas.VillageVolunteerRegister,
    db: Session = Depends(get_db),
):
    if crud.get_user_by_thai_id(db, user_in.thai_id):
        _raise_duplicate_user()
    try:
        user = crud.create_village_volunteer(db, user_in)
    except IntegrityError:
        db.rollback()
        _raise_duplicate_user()
    return user_to_read(user)


@router.post(
    "/admin/case-managers",
    response_model=schemas.UserRead,
    status_code=status.HTTP_201_CREATED,
)
def create_case_manager(
    user_in: schemas.CaseManagerCreate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if crud.get_user_by_thai_id(db, user_in.thai_id):
        _raise_duplicate_user()
    try:
        user = crud.create_case_manager(db, user_in, admin)
    except IntegrityError:
        db.rollback()
        _raise_duplicate_user()
    return user_to_read(user)


@router.post("/login", response_model=schemas.TokenRead)
def login(user_in: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = _authenticate_user(db, user_in.thai_id, user_in.password)
    return schemas.TokenRead(access_token=create_access_token(user), user=user_to_read(user))


@router.post("/token", response_model=schemas.TokenRead)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = _authenticate_user(db, form_data.username, form_data.password)
    return schemas.TokenRead(access_token=create_access_token(user), user=user_to_read(user))


@router.get("/me", response_model=schemas.UserRead)
def read_me(current_user: models.User = Depends(get_current_user)):
    return user_to_read(current_user)
