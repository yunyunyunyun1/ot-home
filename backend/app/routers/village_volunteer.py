from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.security import require_village_volunteer
from app.serializers import kid_to_read

router = APIRouter(prefix="/village-volunteer", tags=["village volunteer"])


@router.get("/kids", response_model=list[schemas.KidRead])
def list_assigned_kids(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    village_volunteer: models.User = Depends(require_village_volunteer),
    db: Session = Depends(get_db),
):
    kids = crud.list_kids_for_village_volunteer(
        db,
        village_volunteer=village_volunteer,
        skip=skip,
        limit=limit,
    )
    return [kid_to_read(kid) for kid in kids]


@router.get(
    "/kids/{kid_id}/home-programs",
    response_model=list[schemas.HomeProgramActivityRead],
)
def list_kid_home_programs(
    kid_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    village_volunteer: models.User = Depends(require_village_volunteer),
    db: Session = Depends(get_db),
):
    kid = crud.get_kid_for_village_volunteer(db, kid_id, village_volunteer)
    if kid is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found for this village volunteer",
        )

    return crud.list_latest_home_program_activities_for_kid(
        db,
        kid,
        skip=skip,
        limit=limit,
    )


def _get_assigned_kid_and_activity(
    kid_id: UUID,
    activity_id: UUID,
    village_volunteer: models.User,
    db: Session,
) -> tuple[models.Kid, models.HomeProgramActivity]:
    kid = crud.get_kid_for_village_volunteer(db, kid_id, village_volunteer)
    if kid is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found for this village volunteer",
        )

    activity = crud.get_home_program_activity_for_kid(db, kid, activity_id)
    if activity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Home program not found for this kid",
        )

    return kid, activity


@router.get(
    "/kids/{kid_id}/home-programs/{activity_id}/follow-ups",
    response_model=list[schemas.HomeProgramFollowUpRead],
)
def list_home_program_follow_ups(
    kid_id: UUID,
    activity_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    village_volunteer: models.User = Depends(require_village_volunteer),
    db: Session = Depends(get_db),
):
    _, activity = _get_assigned_kid_and_activity(kid_id, activity_id, village_volunteer, db)
    return crud.list_home_program_follow_ups(
        db,
        activity,
        village_volunteer,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/kids/{kid_id}/home-programs/{activity_id}/follow-ups",
    response_model=schemas.HomeProgramFollowUpRead,
    status_code=status.HTTP_201_CREATED,
)
def create_home_program_follow_up(
    kid_id: UUID,
    activity_id: UUID,
    follow_up_in: schemas.HomeProgramFollowUpCreate,
    village_volunteer: models.User = Depends(require_village_volunteer),
    db: Session = Depends(get_db),
):
    kid, activity = _get_assigned_kid_and_activity(
        kid_id,
        activity_id,
        village_volunteer,
        db,
    )
    return crud.create_home_program_follow_up(
        db,
        kid,
        activity,
        village_volunteer,
        follow_up_in,
    )
