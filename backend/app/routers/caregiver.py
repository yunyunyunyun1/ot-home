from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.security import require_caregiver
from app.serializers import (
    availability_slot_to_read,
    denver_evaluation_to_read,
    kid_to_read,
    therapy_session_to_read,
)

router = APIRouter(prefix="/caregiver", tags=["caregiver"])


@router.get("/kids", response_model=list[schemas.KidRead])
def list_assigned_kids(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    kids = crud.list_kids_for_caregiver(
        db,
        caregiver=caregiver,
        skip=skip,
        limit=limit,
    )
    return [kid_to_read(kid) for kid in kids]


@router.get("/home-program-templates", response_model=list[schemas.HomeProgramTemplateRead])
def list_home_program_templates(
    age_range: str | None = Query(default=None),
    aspect: str | None = Query(default=None),
    caregiver: models.User = Depends(require_caregiver),
):
    return crud.list_home_program_templates(age_range=age_range, aspect=aspect)


@router.get("/availability", response_model=list[schemas.CaregiverAvailabilityRead])
def list_availability_slots(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    slots = crud.list_availability_slots_for_caregiver(
        db,
        caregiver=caregiver,
        skip=skip,
        limit=limit,
    )
    return [availability_slot_to_read(slot) for slot in slots]


@router.post("/availability", response_model=schemas.CaregiverAvailabilityRead)
def create_availability_slot(
    slot_in: schemas.CaregiverAvailabilityCreate,
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    slot = crud.create_availability_slot(db, caregiver, slot_in)
    return availability_slot_to_read(slot)


def _get_owned_availability_slot(
    slot_id: UUID,
    caregiver: models.User,
    db: Session,
) -> models.CaregiverAvailabilitySlot:
    slot = crud.get_availability_slot_by_id(db, slot_id)
    if slot is None or slot.caregiver_id != caregiver.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability slot not found",
        )
    return slot


@router.patch("/availability/{slot_id}", response_model=schemas.CaregiverAvailabilityRead)
def update_availability_slot(
    slot_id: UUID,
    slot_in: schemas.CaregiverAvailabilityUpdate,
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    slot = _get_owned_availability_slot(slot_id, caregiver, db)
    if slot.assignment is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Booked availability slots cannot be updated",
        )
    updated_slot = crud.update_availability_slot(db, slot, slot_in)
    return availability_slot_to_read(updated_slot)


@router.delete("/availability/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability_slot(
    slot_id: UUID,
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    slot = _get_owned_availability_slot(slot_id, caregiver, db)
    if slot.assignment is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Booked availability slots cannot be deleted",
        )
    crud.delete_availability_slot(db, slot)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _get_assigned_kid(
    kid_id: UUID,
    caregiver: models.User,
    db: Session,
) -> models.Kid:
    kid = crud.get_kid_for_caregiver(db, kid_id, caregiver)
    if kid is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned kid not found",
        )
    return kid


@router.get(
    "/kids/{kid_id}/denver-evaluations",
    response_model=list[schemas.DenverEvaluationRead],
)
def list_denver_evaluations(
    kid_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    kid = _get_assigned_kid(kid_id, caregiver, db)
    evaluations = crud.list_denver_evaluations_for_kid(db, kid, skip=skip, limit=limit)
    return [denver_evaluation_to_read(evaluation) for evaluation in evaluations]


@router.get(
    "/kids/{kid_id}/therapy-sessions",
    response_model=list[schemas.TherapySessionRead],
)
def list_therapy_sessions(
    kid_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    kid = _get_assigned_kid(kid_id, caregiver, db)
    sessions = crud.list_therapy_sessions_for_caregiver_kid(
        db,
        kid,
        caregiver,
        skip=skip,
        limit=limit,
    )
    return [therapy_session_to_read(session) for session in sessions]


@router.post(
    "/kids/{kid_id}/denver-evaluations",
    response_model=schemas.DenverEvaluationRead,
    status_code=status.HTTP_201_CREATED,
)
def create_denver_evaluation(
    kid_id: UUID,
    evaluation_in: schemas.DenverEvaluationCreate,
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    kid = _get_assigned_kid(kid_id, caregiver, db)
    therapy_session = crud.get_next_unevaluated_therapy_session(db, kid, caregiver)
    if therapy_session is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No scheduled therapy session is available for evaluation",
        )
    existing_evaluations = crud.list_denver_evaluations_for_kid(db, kid)
    expected_session = str(len(existing_evaluations) + 1)
    if evaluation_in.evaluation_name != expected_session:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Next evaluation session must be {expected_session}",
        )
    try:
        evaluation = crud.create_denver_evaluation(db, kid, caregiver, therapy_session, evaluation_in)
        return denver_evaluation_to_read(evaluation)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This scheduled slot already has an evaluation",
        ) from exc


@router.get(
    "/kids/{kid_id}/home-programs",
    response_model=list[schemas.HomeProgramActivityRead],
)
def list_home_program_activities(
    kid_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    kid = _get_assigned_kid(kid_id, caregiver, db)
    return crud.list_home_program_activities_for_kid(
        db,
        kid,
        caregiver,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/kids/{kid_id}/home-programs",
    response_model=schemas.HomeProgramActivityRead,
    status_code=status.HTTP_201_CREATED,
)
def create_home_program_activity(
    kid_id: UUID,
    activity_in: schemas.HomeProgramActivityCreate,
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    kid = _get_assigned_kid(kid_id, caregiver, db)
    if activity_in.evaluation_id is not None:
        evaluation = crud.get_denver_evaluation_for_kid(db, kid, activity_in.evaluation_id)
        if evaluation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluation not found for this kid",
            )
    return crud.create_home_program_activity(db, kid, caregiver, activity_in)


@router.patch(
    "/kids/{kid_id}/home-programs/{activity_id}",
    response_model=schemas.HomeProgramActivityRead,
)
def update_home_program_activity(
    kid_id: UUID,
    activity_id: UUID,
    activity_in: schemas.HomeProgramActivityUpdate,
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    kid = _get_assigned_kid(kid_id, caregiver, db)
    activity = crud.get_home_program_activity_for_caregiver_kid(
        db,
        kid,
        caregiver,
        activity_id,
    )
    if activity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Home program not found",
        )
    if activity_in.evaluation_id is not None:
        evaluation = crud.get_denver_evaluation_for_kid(db, kid, activity_in.evaluation_id)
        if evaluation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluation not found for this kid",
            )
    return crud.update_home_program_activity(db, activity, activity_in)


@router.delete(
    "/kids/{kid_id}/home-programs/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_home_program_activity(
    kid_id: UUID,
    activity_id: UUID,
    caregiver: models.User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    kid = _get_assigned_kid(kid_id, caregiver, db)
    activity = crud.get_home_program_activity_for_caregiver_kid(
        db,
        kid,
        caregiver,
        activity_id,
    )
    if activity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Home program not found",
        )
    crud.delete_home_program_activity(db, activity)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
