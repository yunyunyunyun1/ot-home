import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session
from uuid import UUID

from app import models, schemas
from app.security import get_password_hash

HOME_PROGRAM_TEMPLATES_PATH = Path(__file__).parent / "data" / "home_program_templates.json"


def mask_thai_id(thai_id: str) -> str:
    return f"{thai_id[:4]}*****{thai_id[-4:]}"


def list_home_program_templates(
    age_range: str | None = None,
    aspect: str | None = None,
) -> list[schemas.HomeProgramTemplateRead]:
    templates = [
        schemas.HomeProgramTemplateRead.model_validate(item)
        for item in json.loads(HOME_PROGRAM_TEMPLATES_PATH.read_text(encoding="utf-8"))
    ]
    if age_range:
        templates = [template for template in templates if template.age_range == age_range]
    if aspect:
        templates = [template for template in templates if template.aspect == aspect]
    return templates


def get_user_by_thai_id(db: Session, thai_id: str) -> models.User | None:
    statement = select(models.User).where(models.User.thai_id == thai_id)
    return db.scalar(statement)


def create_address(db: Session, address_in: schemas.AddressCreate) -> models.Address:
    address = models.Address(**address_in.model_dump())
    db.add(address)
    db.flush()
    return address


def create_parent(db: Session, user_in: schemas.ParentRegister) -> models.User:
    address = create_address(db, user_in.address)
    user = models.User(
        thai_id=user_in.thai_id,
        password_hash=get_password_hash(user_in.password),
        role=models.UserRole.PARENT,
        full_name=user_in.full_name,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender.value,
        phone=user_in.phone,
        email=user_in.email,
    )
    user.parent_profile = models.ParentProfile(address=address)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_caregiver(db: Session, user_in: schemas.ProfessionalRegister) -> models.User:
    address = create_address(db, user_in.address)
    user = models.User(
        thai_id=user_in.thai_id,
        password_hash=get_password_hash(user_in.password),
        role=models.UserRole.CAREGIVER,
        full_name=user_in.full_name,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender.value,
        phone=user_in.phone,
        email=user_in.email,
    )
    user.caregiver_profile = models.CaregiverProfile(
        license_id=user_in.license_id,
        hospital_or_clinic=user_in.hospital_or_clinic,
        address=address,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_village_volunteer(db: Session, user_in: schemas.VillageVolunteerRegister) -> models.User:
    address = create_address(db, user_in.address)
    user = models.User(
        thai_id=user_in.thai_id,
        password_hash=get_password_hash(user_in.password),
        role=models.UserRole.VILLAGE_VOLUNTEER,
        full_name=user_in.full_name,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender.value,
        phone=user_in.phone,
        email=user_in.email,
    )
    user.village_volunteer_profile = models.VillageVolunteerProfile(
        hospital_or_clinic=user_in.hospital_or_clinic,
        address=address,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_case_manager(
    db: Session,
    user_in: schemas.CaseManagerCreate,
    admin: models.User | None,
) -> models.User:
    address = create_address(db, user_in.address)
    user = models.User(
        thai_id=user_in.thai_id,
        password_hash=get_password_hash(user_in.password),
        role=models.UserRole.CASE_MANAGER,
        full_name=user_in.full_name,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender.value,
        phone=user_in.phone,
        email=user_in.email,
    )
    user.case_manager_profile = models.CaseManagerProfile(
        address=address,
        created_by_admin=admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_case_managers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[models.User]:
    statement = (
        select(models.User)
        .join(models.User.case_manager_profile)
        .where(models.User.role == models.UserRole.CASE_MANAGER)
        .where(models.User.is_active.is_(True))
        .order_by(models.User.full_name.asc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement))


def get_case_manager_by_id(db: Session, case_manager_id: UUID) -> models.User | None:
    statement = (
        select(models.User)
        .join(models.User.case_manager_profile)
        .where(models.User.id == case_manager_id)
        .where(models.User.role == models.UserRole.CASE_MANAGER)
    )
    return db.scalar(statement)


def update_case_manager(
    db: Session,
    case_manager: models.User,
    user_in: schemas.CaseManagerUpdate,
) -> models.User:
    case_manager.full_name = user_in.full_name
    case_manager.date_of_birth = user_in.date_of_birth
    case_manager.gender = user_in.gender.value
    case_manager.phone = user_in.phone
    case_manager.email = user_in.email
    if case_manager.case_manager_profile is not None:
        update_address(case_manager.case_manager_profile.address, user_in.address)
    db.commit()
    db.refresh(case_manager)
    return case_manager


def deactivate_case_manager(db: Session, case_manager: models.User) -> None:
    case_manager.is_active = False
    db.commit()


def create_admin(db: Session, thai_id: str, password: str) -> models.User:
    user = models.User(
        thai_id=thai_id,
        password_hash=get_password_hash(password),
        role=models.UserRole.ADMIN,
        full_name="System Admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_kid_by_thai_id(db: Session, thai_id: str) -> models.Kid | None:
    statement = select(models.Kid).where(models.Kid.thai_id == thai_id)
    return db.scalar(statement)


def get_kid_by_id(db: Session, kid_id: UUID) -> models.Kid | None:
    statement = select(models.Kid).where(models.Kid.id == kid_id)
    return db.scalar(statement)


def get_caregiver_by_id(db: Session, caregiver_id: UUID) -> models.User | None:
    statement = (
        select(models.User)
        .join(models.User.caregiver_profile)
        .where(models.User.id == caregiver_id)
        .where(models.User.role == models.UserRole.CAREGIVER)
    )
    return db.scalar(statement)


def get_village_volunteer_by_id(db: Session, village_volunteer_id: UUID) -> models.User | None:
    statement = (
        select(models.User)
        .join(models.User.village_volunteer_profile)
        .where(models.User.id == village_volunteer_id)
        .where(models.User.role == models.UserRole.VILLAGE_VOLUNTEER)
    )
    return db.scalar(statement)


def create_kid(
    db: Session,
    kid_in: schemas.KidCreate,
    case_manager: models.User,
) -> models.Kid:
    address = create_address(db, kid_in.address)
    kid = models.Kid(
        thai_id=kid_in.thai_id,
        full_name=kid_in.full_name,
        date_of_birth=kid_in.date_of_birth,
        gender=kid_in.gender.value,
        notable_symptoms=kid_in.notable_symptoms,
        address=address,
        created_by_case_manager=case_manager,
    )
    db.add(kid)
    db.commit()
    db.refresh(kid)
    return kid


def update_address(
    address: models.Address,
    address_in: schemas.AddressCreate,
) -> models.Address:
    for field, value in address_in.model_dump().items():
        setattr(address, field, value)
    return address


def update_kid(
    db: Session,
    kid: models.Kid,
    kid_in: schemas.KidUpdate,
) -> models.Kid:
    kid.full_name = kid_in.full_name
    kid.date_of_birth = kid_in.date_of_birth
    kid.gender = kid_in.gender.value
    kid.notable_symptoms = kid_in.notable_symptoms
    update_address(kid.address, kid_in.address)
    db.commit()
    db.refresh(kid)
    return kid


def delete_kid(db: Session, kid: models.Kid) -> None:
    db.delete(kid)
    db.commit()


def list_kids_for_case_manager_province(
    db: Session,
    province: str,
    skip: int = 0,
    limit: int = 100,
) -> list[models.Kid]:
    statement = (
        select(models.Kid)
        .join(models.Kid.address)
        .where(models.Address.province == province)
        .order_by(models.Kid.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def list_caregivers_for_province(
    db: Session,
    province: str,
    skip: int = 0,
    limit: int = 100,
) -> list[models.User]:
    statement = (
        select(models.User)
        .join(models.User.caregiver_profile)
        .join(models.CaregiverProfile.address)
        .where(models.User.role == models.UserRole.CAREGIVER)
        .where(models.Address.province == province)
        .order_by(models.User.full_name.asc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def list_village_volunteers_for_province(
    db: Session,
    province: str,
    skip: int = 0,
    limit: int = 100,
) -> list[models.User]:
    statement = (
        select(models.User)
        .join(models.User.village_volunteer_profile)
        .join(models.VillageVolunteerProfile.address)
        .where(models.User.role == models.UserRole.VILLAGE_VOLUNTEER)
        .where(models.Address.province == province)
        .order_by(models.User.full_name.asc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_availability_slot_by_id(
    db: Session,
    slot_id: UUID,
) -> models.CaregiverAvailabilitySlot | None:
    statement = select(models.CaregiverAvailabilitySlot).where(
        models.CaregiverAvailabilitySlot.id == slot_id
    )
    return db.scalar(statement)


def create_availability_slot(
    db: Session,
    caregiver: models.User,
    slot_in: schemas.CaregiverAvailabilityCreate,
) -> models.CaregiverAvailabilitySlot:
    slot = models.CaregiverAvailabilitySlot(
        caregiver=caregiver,
        available_date=slot_in.available_date,
        start_time=slot_in.start_time,
        end_time=slot_in.end_time,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


def update_availability_slot(
    db: Session,
    slot: models.CaregiverAvailabilitySlot,
    slot_in: schemas.CaregiverAvailabilityUpdate,
) -> models.CaregiverAvailabilitySlot:
    slot.available_date = slot_in.available_date
    slot.start_time = slot_in.start_time
    slot.end_time = slot_in.end_time
    db.commit()
    db.refresh(slot)
    return slot


def delete_availability_slot(
    db: Session,
    slot: models.CaregiverAvailabilitySlot,
) -> None:
    db.delete(slot)
    db.commit()


def list_availability_slots_for_caregiver(
    db: Session,
    caregiver: models.User,
    skip: int = 0,
    limit: int = 100,
) -> list[models.CaregiverAvailabilitySlot]:
    statement = (
        select(models.CaregiverAvailabilitySlot)
        .where(models.CaregiverAvailabilitySlot.caregiver_id == caregiver.id)
        .order_by(
            models.CaregiverAvailabilitySlot.available_date.asc(),
            models.CaregiverAvailabilitySlot.start_time.asc(),
        )
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def assign_kid_to_caregiver(
    db: Session,
    kid: models.Kid,
    caregiver: models.User,
    case_manager: models.User,
) -> models.CaregiverKidAssignment:
    assignment = kid.caregiver_assignment
    if assignment is None:
        assignment = models.CaregiverKidAssignment(
            kid=kid,
            caregiver=caregiver,
            assigned_by_case_manager=case_manager,
        )
        db.add(assignment)
    else:
        assignment.caregiver = caregiver
        assignment.assigned_by_case_manager = case_manager

    db.flush()
    return assignment


def assign_kid_to_village_volunteer(
    db: Session,
    kid: models.Kid,
    village_volunteer: models.User,
    case_manager: models.User,
) -> models.VillageVolunteerKidAssignment:
    assignment = next(
        (
            existing_assignment
            for existing_assignment in kid.village_volunteer_assignments
            if existing_assignment.village_volunteer_id == village_volunteer.id
        ),
        None,
    )
    if assignment is None:
        assignment = models.VillageVolunteerKidAssignment(
            kid=kid,
            village_volunteer=village_volunteer,
            assigned_by_case_manager=case_manager,
        )
        db.add(assignment)
    else:
        assignment.assigned_by_case_manager = case_manager

    db.commit()
    db.refresh(assignment)
    return assignment


def list_therapy_sessions_for_kid_on_date(
    db: Session,
    kid: models.Kid,
    scheduled_date,
) -> list[models.TherapySession]:
    statement = (
        select(models.TherapySession)
        .join(models.TherapySession.availability_slot)
        .where(models.TherapySession.kid_id == kid.id)
        .where(models.CaregiverAvailabilitySlot.available_date == scheduled_date)
        .where(models.TherapySession.status != models.TherapySessionStatus.CANCELLED)
    )
    return list(db.scalars(statement).all())


def create_therapy_session(
    db: Session,
    kid: models.Kid,
    caregiver: models.User,
    case_manager: models.User,
    availability_slot: models.CaregiverAvailabilitySlot,
) -> models.TherapySession:
    session = models.TherapySession(
        kid=kid,
        caregiver=caregiver,
        case_manager=case_manager,
        availability_slot=availability_slot,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_kids_for_caregiver(
    db: Session,
    caregiver: models.User,
    skip: int = 0,
    limit: int = 100,
) -> list[models.Kid]:
    statement = (
        select(models.Kid)
        .join(models.Kid.caregiver_assignment)
        .where(models.CaregiverKidAssignment.caregiver_id == caregiver.id)
        .order_by(models.Kid.full_name.asc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_kid_for_caregiver(
    db: Session,
    kid_id: UUID,
    caregiver: models.User,
) -> models.Kid | None:
    statement = (
        select(models.Kid)
        .join(models.Kid.caregiver_assignment)
        .where(models.Kid.id == kid_id)
        .where(models.CaregiverKidAssignment.caregiver_id == caregiver.id)
    )
    return db.scalar(statement)


def list_kids_for_village_volunteer(
    db: Session,
    village_volunteer: models.User,
    skip: int = 0,
    limit: int = 100,
) -> list[models.Kid]:
    statement = (
        select(models.Kid)
        .join(models.Kid.village_volunteer_assignments)
        .where(models.VillageVolunteerKidAssignment.village_volunteer_id == village_volunteer.id)
        .order_by(models.Kid.full_name.asc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_kid_for_village_volunteer(
    db: Session,
    kid_id: UUID,
    village_volunteer: models.User,
) -> models.Kid | None:
    statement = (
        select(models.Kid)
        .join(models.Kid.village_volunteer_assignments)
        .where(models.Kid.id == kid_id)
        .where(models.VillageVolunteerKidAssignment.village_volunteer_id == village_volunteer.id)
    )
    return db.scalar(statement)


def list_therapy_sessions_for_caregiver_kid(
    db: Session,
    kid: models.Kid,
    caregiver: models.User,
    skip: int = 0,
    limit: int = 100,
) -> list[models.TherapySession]:
    statement = (
        select(models.TherapySession)
        .join(models.TherapySession.availability_slot)
        .where(models.TherapySession.kid_id == kid.id)
        .where(models.TherapySession.caregiver_id == caregiver.id)
        .where(models.TherapySession.status != models.TherapySessionStatus.CANCELLED)
        .order_by(
            models.CaregiverAvailabilitySlot.available_date.asc(),
            models.CaregiverAvailabilitySlot.start_time.asc(),
        )
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_next_unevaluated_therapy_session(
    db: Session,
    kid: models.Kid,
    caregiver: models.User,
) -> models.TherapySession | None:
    statement = (
        select(models.TherapySession)
        .join(models.TherapySession.availability_slot)
        .outerjoin(models.TherapySession.denver_evaluation)
        .where(models.TherapySession.kid_id == kid.id)
        .where(models.TherapySession.caregiver_id == caregiver.id)
        .where(models.TherapySession.status == models.TherapySessionStatus.SCHEDULED)
        .where(models.DenverEvaluation.id.is_(None))
        .order_by(
            models.CaregiverAvailabilitySlot.available_date.asc(),
            models.CaregiverAvailabilitySlot.start_time.asc(),
        )
        .limit(1)
    )
    return db.scalar(statement)


def list_denver_evaluations_for_kid(
    db: Session,
    kid: models.Kid,
    skip: int = 0,
    limit: int = 100,
) -> list[models.DenverEvaluation]:
    statement = (
        select(models.DenverEvaluation)
        .where(models.DenverEvaluation.kid_id == kid.id)
        .order_by(models.DenverEvaluation.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def create_denver_evaluation(
    db: Session,
    kid: models.Kid,
    caregiver: models.User,
    therapy_session: models.TherapySession,
    evaluation_in: schemas.DenverEvaluationCreate,
) -> models.DenverEvaluation:
    assignment = kid.caregiver_assignment
    if assignment is None:
        raise ValueError("Caregiver assignment is required")
    evaluation = models.DenverEvaluation(
        kid=kid,
        evaluated_by_caregiver=caregiver,
        therapy_session=therapy_session,
        assignment=assignment,
        availability_slot=therapy_session.availability_slot,
        **evaluation_in.model_dump(),
    )
    db.add(evaluation)
    therapy_session.status = models.TherapySessionStatus.COMPLETED
    db.commit()
    db.refresh(evaluation)
    return evaluation


def get_denver_evaluation_for_kid(
    db: Session,
    kid: models.Kid,
    evaluation_id: UUID,
) -> models.DenverEvaluation | None:
    statement = (
        select(models.DenverEvaluation)
        .where(models.DenverEvaluation.id == evaluation_id)
        .where(models.DenverEvaluation.kid_id == kid.id)
    )
    return db.scalar(statement)


def update_denver_evaluation(
    db: Session,
    evaluation: models.DenverEvaluation,
    evaluation_in: schemas.DenverEvaluationUpdate,
) -> models.DenverEvaluation:
    evaluation.aspect_1_result = evaluation_in.aspect_1_result
    evaluation.aspect_2_result = evaluation_in.aspect_2_result
    evaluation.aspect_3_result = evaluation_in.aspect_3_result
    evaluation.aspect_4_result = evaluation_in.aspect_4_result
    db.commit()
    db.refresh(evaluation)
    return evaluation


def list_home_program_activities_for_kid(
    db: Session,
    kid: models.Kid,
    caregiver: models.User,
    skip: int = 0,
    limit: int = 100,
) -> list[models.HomeProgramActivity]:
    statement = (
        select(models.HomeProgramActivity)
        .where(models.HomeProgramActivity.kid_id == kid.id)
        .where(models.HomeProgramActivity.caregiver_id == caregiver.id)
        .order_by(models.HomeProgramActivity.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def list_latest_home_program_activities_for_kid(
    db: Session,
    kid: models.Kid,
    skip: int = 0,
    limit: int = 100,
) -> list[models.HomeProgramActivity]:
    latest_evaluation_id = db.scalar(
        select(models.HomeProgramActivity.evaluation_id)
        .join(models.HomeProgramActivity.evaluation)
        .where(models.HomeProgramActivity.kid_id == kid.id)
        .where(models.HomeProgramActivity.evaluation_id.is_not(None))
        .order_by(models.DenverEvaluation.created_at.desc())
        .limit(1)
    )
    if latest_evaluation_id is not None:
        statement = (
            select(models.HomeProgramActivity)
            .where(models.HomeProgramActivity.kid_id == kid.id)
            .where(models.HomeProgramActivity.evaluation_id == latest_evaluation_id)
            .order_by(models.HomeProgramActivity.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())

    latest_created_at = db.scalar(
        select(models.HomeProgramActivity.created_at)
        .where(models.HomeProgramActivity.kid_id == kid.id)
        .order_by(models.HomeProgramActivity.created_at.desc())
        .limit(1)
    )
    if latest_created_at is None:
        return []

    statement = (
        select(models.HomeProgramActivity)
        .where(models.HomeProgramActivity.kid_id == kid.id)
        .where(models.HomeProgramActivity.created_at == latest_created_at)
        .order_by(models.HomeProgramActivity.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def list_all_home_program_activities_for_kid(
    db: Session,
    kid: models.Kid,
    skip: int = 0,
    limit: int = 100,
) -> list[models.HomeProgramActivity]:
    statement = (
        select(models.HomeProgramActivity)
        .where(models.HomeProgramActivity.kid_id == kid.id)
        .order_by(models.HomeProgramActivity.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def create_home_program_activity(
    db: Session,
    kid: models.Kid,
    caregiver: models.User,
    activity_in: schemas.HomeProgramActivityCreate,
) -> models.HomeProgramActivity:
    activity = models.HomeProgramActivity(
        kid=kid,
        caregiver=caregiver,
        **activity_in.model_dump(),
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def get_home_program_activity_for_caregiver_kid(
    db: Session,
    kid: models.Kid,
    caregiver: models.User,
    activity_id: UUID,
) -> models.HomeProgramActivity | None:
    statement = (
        select(models.HomeProgramActivity)
        .where(models.HomeProgramActivity.id == activity_id)
        .where(models.HomeProgramActivity.kid_id == kid.id)
        .where(models.HomeProgramActivity.caregiver_id == caregiver.id)
    )
    return db.scalar(statement)


def update_home_program_activity(
    db: Session,
    activity: models.HomeProgramActivity,
    activity_in: schemas.HomeProgramActivityUpdate,
) -> models.HomeProgramActivity:
    for field, value in activity_in.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    db.commit()
    db.refresh(activity)
    return activity


def delete_home_program_activity(
    db: Session,
    activity: models.HomeProgramActivity,
) -> None:
    db.delete(activity)
    db.commit()


def get_home_program_activity_for_kid(
    db: Session,
    kid: models.Kid,
    activity_id: UUID,
) -> models.HomeProgramActivity | None:
    statement = (
        select(models.HomeProgramActivity)
        .where(models.HomeProgramActivity.id == activity_id)
        .where(models.HomeProgramActivity.kid_id == kid.id)
    )
    return db.scalar(statement)


def list_home_program_follow_ups(
    db: Session,
    activity: models.HomeProgramActivity,
    village_volunteer: models.User,
    skip: int = 0,
    limit: int = 100,
) -> list[models.HomeProgramFollowUp]:
    statement = (
        select(models.HomeProgramFollowUp)
        .where(models.HomeProgramFollowUp.home_program_activity_id == activity.id)
        .where(models.HomeProgramFollowUp.village_volunteer_id == village_volunteer.id)
        .order_by(models.HomeProgramFollowUp.performed_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def list_home_program_follow_ups_for_activity(
    db: Session,
    activity: models.HomeProgramActivity,
    skip: int = 0,
    limit: int = 100,
) -> list[models.HomeProgramFollowUp]:
    statement = (
        select(models.HomeProgramFollowUp)
        .where(models.HomeProgramFollowUp.home_program_activity_id == activity.id)
        .order_by(models.HomeProgramFollowUp.performed_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def create_home_program_follow_up(
    db: Session,
    kid: models.Kid,
    activity: models.HomeProgramActivity,
    village_volunteer: models.User,
    follow_up_in: schemas.HomeProgramFollowUpCreate,
) -> models.HomeProgramFollowUp:
    follow_up = models.HomeProgramFollowUp(
        kid=kid,
        home_program_activity=activity,
        village_volunteer=village_volunteer,
        **follow_up_in.model_dump(),
    )
    db.add(follow_up)
    db.commit()
    db.refresh(follow_up)
    return follow_up
