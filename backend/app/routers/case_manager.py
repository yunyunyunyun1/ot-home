from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.security import require_case_manager
from app.serializers import caregiver_to_read, kid_to_read, village_volunteer_to_read

router = APIRouter(prefix="/case-manager", tags=["case manager"])


def _get_case_manager_province(case_manager: models.User) -> str:
    profile = case_manager.case_manager_profile
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Case manager profile is required",
        )
    return profile.address.province


def _get_kid_in_case_manager_province(
    kid_id: UUID,
    case_manager: models.User,
    db: Session,
) -> models.Kid:
    kid = crud.get_kid_by_id(db, kid_id)
    if kid is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found",
        )
    if kid.address.province != _get_case_manager_province(case_manager):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kid is outside your responsible province",
        )
    return kid


@router.get("/me", response_model=schemas.CaseManagerContextRead)
def read_case_manager_context(
    case_manager: models.User = Depends(require_case_manager),
):
    return schemas.CaseManagerContextRead(province=_get_case_manager_province(case_manager))


@router.post("/kids", response_model=schemas.KidRead, status_code=status.HTTP_201_CREATED)
def create_kid(
    kid_in: schemas.KidCreate,
    case_manager: models.User = Depends(require_case_manager),
    db: Session = Depends(get_db),
):
    case_manager_province = _get_case_manager_province(case_manager)
    if kid_in.address.province != case_manager_province:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kid address province must match case manager responsible province",
        )
    if crud.get_kid_by_thai_id(db, kid_in.thai_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A kid with that Thai ID already exists",
        )

    try:
        return kid_to_read(crud.create_kid(db, kid_in, case_manager))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A kid with that Thai ID already exists",
        )


@router.get("/kids", response_model=list[schemas.KidRead])
def list_kids(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    case_manager: models.User = Depends(require_case_manager),
    db: Session = Depends(get_db),
):
    case_manager_province = _get_case_manager_province(case_manager)
    kids = crud.list_kids_for_case_manager_province(
        db,
        province=case_manager_province,
        skip=skip,
        limit=limit,
    )
    return [kid_to_read(kid) for kid in kids]


@router.patch("/kids/{kid_id}", response_model=schemas.KidRead)
def update_kid(
    kid_id: UUID,
    kid_in: schemas.KidUpdate,
    case_manager: models.User = Depends(require_case_manager),
    db: Session = Depends(get_db),
):
    case_manager_province = _get_case_manager_province(case_manager)
    if kid_in.address.province != case_manager_province:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kid address province must match case manager responsible province",
        )

    kid = _get_kid_in_case_manager_province(kid_id, case_manager, db)
    return kid_to_read(crud.update_kid(db, kid, kid_in))


@router.delete("/kids/{kid_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kid(
    kid_id: UUID,
    case_manager: models.User = Depends(require_case_manager),
    db: Session = Depends(get_db),
):
    kid = _get_kid_in_case_manager_province(kid_id, case_manager, db)
    crud.delete_kid(db, kid)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/caregivers", response_model=list[schemas.CaregiverRead])
def list_caregivers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    case_manager: models.User = Depends(require_case_manager),
    db: Session = Depends(get_db),
):
    case_manager_province = _get_case_manager_province(case_manager)
    caregivers = crud.list_caregivers_for_province(
        db,
        province=case_manager_province,
        skip=skip,
        limit=limit,
    )
    return [caregiver_to_read(caregiver) for caregiver in caregivers]


@router.get("/village-volunteers", response_model=list[schemas.VillageVolunteerRead])
def list_village_volunteers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    case_manager: models.User = Depends(require_case_manager),
    db: Session = Depends(get_db),
):
    case_manager_province = _get_case_manager_province(case_manager)
    volunteers = crud.list_village_volunteers_for_province(
        db,
        province=case_manager_province,
        skip=skip,
        limit=limit,
    )
    return [village_volunteer_to_read(volunteer) for volunteer in volunteers]


@router.post("/assignments", response_model=schemas.KidRead)
def assign_kid_to_caregiver(
    assignment_in: schemas.KidAssignmentCreate,
    case_manager: models.User = Depends(require_case_manager),
    db: Session = Depends(get_db),
):
    case_manager_province = _get_case_manager_province(case_manager)
    kid = _get_kid_in_case_manager_province(assignment_in.kid_id, case_manager, db)

    caregiver = crud.get_caregiver_by_id(db, assignment_in.caregiver_id)
    if caregiver is None or caregiver.caregiver_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver not found",
        )
    if caregiver.caregiver_profile.address.province != case_manager_province:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Caregiver is outside your responsible province",
        )
    availability_slot = crud.get_availability_slot_by_id(db, assignment_in.availability_slot_id)
    if availability_slot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability slot not found",
        )
    if availability_slot.caregiver_id != caregiver.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Availability slot does not belong to this caregiver",
        )
    if availability_slot.assignment is not None and availability_slot.assignment.kid_id != kid.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Availability slot is already booked",
        )
    if availability_slot.therapy_session is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Availability slot is already scheduled",
        )
    if crud.list_therapy_sessions_for_kid_on_date(db, kid, availability_slot.available_date):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Kid already has a scheduled therapy session on this date",
        )

    crud.assign_kid_to_caregiver(db, kid, caregiver, case_manager)
    crud.create_therapy_session(db, kid, caregiver, case_manager, availability_slot)
    db.refresh(kid)
    return kid_to_read(kid)


@router.post("/village-volunteer-assignments", response_model=schemas.KidRead)
def assign_kid_to_village_volunteer(
    assignment_in: schemas.VillageVolunteerKidAssignmentCreate,
    case_manager: models.User = Depends(require_case_manager),
    db: Session = Depends(get_db),
):
    case_manager_province = _get_case_manager_province(case_manager)
    kid = _get_kid_in_case_manager_province(assignment_in.kid_id, case_manager, db)

    village_volunteer = crud.get_village_volunteer_by_id(
        db,
        assignment_in.village_volunteer_id,
    )
    if village_volunteer is None or village_volunteer.village_volunteer_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Village volunteer not found",
        )
    if village_volunteer.village_volunteer_profile.address.province != case_manager_province:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Village volunteer is outside your responsible province",
        )

    crud.assign_kid_to_village_volunteer(db, kid, village_volunteer, case_manager)
    db.refresh(kid)
    return kid_to_read(kid)
