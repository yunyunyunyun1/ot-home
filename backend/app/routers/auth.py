from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    require_admin,
    verify_password,
)
from app.serializers import case_manager_to_read, user_to_read

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
    response_model=schemas.CaseManagerRead,
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
    return case_manager_to_read(user)


@router.get("/admin/case-managers", response_model=list[schemas.CaseManagerRead])
def list_case_managers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    case_managers = crud.list_case_managers(db, skip=skip, limit=limit)
    return [case_manager_to_read(case_manager) for case_manager in case_managers]


@router.patch("/admin/case-managers/{case_manager_id}", response_model=schemas.CaseManagerRead)
def update_case_manager(
    case_manager_id: UUID,
    user_in: schemas.CaseManagerUpdate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    case_manager = crud.get_case_manager_by_id(db, case_manager_id)
    if case_manager is None or not case_manager.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case manager not found",
        )
    return case_manager_to_read(crud.update_case_manager(db, case_manager, user_in))


@router.delete("/admin/case-managers/{case_manager_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case_manager(
    case_manager_id: UUID,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    case_manager = crud.get_case_manager_by_id(db, case_manager_id)
    if case_manager is None or not case_manager.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case manager not found",
        )
    crud.deactivate_case_manager(db, case_manager)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/admin/password-reset", response_model=schemas.UserRead)
def reset_user_password(
    reset_in: schemas.AdminPasswordReset,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_thai_id(db, reset_in.thai_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use account settings to change your own password",
        )

    user.password_hash = get_password_hash(reset_in.temporary_password)
    db.commit()
    db.refresh(user)
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


@router.patch("/me", response_model=schemas.UserRead)
def update_me(
    user_in: schemas.UserAccountUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.full_name = user_in.full_name
    if "date_of_birth" in user_in.model_fields_set:
        current_user.date_of_birth = user_in.date_of_birth
    if "gender" in user_in.model_fields_set:
        current_user.gender = user_in.gender.value if user_in.gender is not None else None
    current_user.profile_image_data = user_in.profile_image_data

    if user_in.new_password is not None:
        if user_in.current_password is None or not verify_password(
            user_in.current_password,
            current_user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )
        current_user.password_hash = get_password_hash(user_in.new_password)

    db.commit()
    db.refresh(current_user)
    return user_to_read(current_user)
