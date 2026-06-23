from app import crud, models, schemas


def user_to_read(user: models.User) -> schemas.UserRead:
    return schemas.UserRead(
        id=user.id,
        thai_id_masked=crud.mask_thai_id(user.thai_id),
        role=user.role,
        full_name=user.full_name,
        date_of_birth=user.date_of_birth,
        gender=user.gender,
        phone=user.phone,
        email=user.email,
        profile_image_data=user.profile_image_data,
        is_active=user.is_active,
        created_at=user.created_at,
    )


def case_manager_to_read(case_manager: models.User) -> schemas.CaseManagerRead:
    profile = case_manager.case_manager_profile
    if profile is None:
        raise ValueError("Case manager profile is required")

    return schemas.CaseManagerRead(
        id=case_manager.id,
        thai_id_masked=crud.mask_thai_id(case_manager.thai_id),
        role=case_manager.role,
        full_name=case_manager.full_name,
        date_of_birth=case_manager.date_of_birth,
        gender=case_manager.gender,
        phone=case_manager.phone,
        email=case_manager.email,
        profile_image_data=case_manager.profile_image_data,
        is_active=case_manager.is_active,
        created_at=case_manager.created_at,
        address=schemas.AddressRead.model_validate(profile.address),
    )


def kid_to_read(kid: models.Kid) -> schemas.KidRead:
    assigned_caregiver = None
    if kid.caregiver_assignment is not None:
        assigned_caregiver = schemas.AssignedCaregiverRead(
            id=kid.caregiver_assignment.caregiver.id,
            full_name=kid.caregiver_assignment.caregiver.full_name,
        )
    assigned_village_volunteers = [
        schemas.AssignedVillageVolunteerRead(
            id=assignment.village_volunteer.id,
            full_name=assignment.village_volunteer.full_name,
        )
        for assignment in kid.village_volunteer_assignments
    ]

    return schemas.KidRead(
        id=kid.id,
        thai_id_masked=crud.mask_thai_id(kid.thai_id),
        full_name=kid.full_name,
        date_of_birth=kid.date_of_birth,
        gender=kid.gender,
        address=schemas.AddressRead.model_validate(kid.address),
        assigned_caregiver=assigned_caregiver,
        assigned_village_volunteers=assigned_village_volunteers,
        created_by_case_manager_id=kid.created_by_case_manager_id,
        created_at=kid.created_at,
        updated_at=kid.updated_at,
    )


def availability_slot_to_read(
    slot: models.CaregiverAvailabilitySlot,
) -> schemas.CaregiverAvailabilityRead:
    assignment = slot.assignment
    therapy_session = slot.therapy_session
    return schemas.CaregiverAvailabilityRead(
        id=slot.id,
        available_date=slot.available_date,
        start_time=slot.start_time,
        end_time=slot.end_time,
        is_booked=therapy_session is not None or assignment is not None,
        assigned_kid_name=(
            therapy_session.kid.full_name
            if therapy_session is not None
            else assignment.kid.full_name
            if assignment is not None
            else None
        ),
    )


def caregiver_to_read(caregiver: models.User) -> schemas.CaregiverRead:
    profile = caregiver.caregiver_profile
    if profile is None:
        raise ValueError("Caregiver profile is required")

    return schemas.CaregiverRead(
        id=caregiver.id,
        thai_id_masked=crud.mask_thai_id(caregiver.thai_id),
        full_name=caregiver.full_name,
        phone=caregiver.phone,
        email=caregiver.email,
        license_id=profile.license_id,
        hospital_or_clinic=profile.hospital_or_clinic,
        address=schemas.AddressRead.model_validate(profile.address),
        availability_slots=[
            availability_slot_to_read(slot) for slot in caregiver.availability_slots
        ],
    )


def village_volunteer_to_read(volunteer: models.User) -> schemas.VillageVolunteerRead:
    profile = volunteer.village_volunteer_profile
    if profile is None:
        raise ValueError("Village volunteer profile is required")

    return schemas.VillageVolunteerRead(
        id=volunteer.id,
        thai_id_masked=crud.mask_thai_id(volunteer.thai_id),
        full_name=volunteer.full_name,
        phone=volunteer.phone,
        email=volunteer.email,
        license_id=profile.license_id,
        hospital_or_clinic=profile.hospital_or_clinic,
        address=schemas.AddressRead.model_validate(profile.address),
    )


def denver_evaluation_to_read(
    evaluation: models.DenverEvaluation,
) -> schemas.DenverEvaluationRead:
    slot = (
        evaluation.therapy_session.availability_slot
        if evaluation.therapy_session is not None
        else evaluation.availability_slot
    )
    return schemas.DenverEvaluationRead(
        id=evaluation.id,
        kid_id=evaluation.kid_id,
        evaluated_by_caregiver_id=evaluation.evaluated_by_caregiver_id,
        therapy_session_id=evaluation.therapy_session_id,
        assignment_id=evaluation.assignment_id,
        availability_slot_id=evaluation.availability_slot_id,
        scheduled_date=slot.available_date if slot is not None else None,
        scheduled_start_time=slot.start_time if slot is not None else None,
        scheduled_end_time=slot.end_time if slot is not None else None,
        evaluation_name=evaluation.evaluation_name,
        aspect_1_result=evaluation.aspect_1_result,
        aspect_2_result=evaluation.aspect_2_result,
        aspect_3_result=evaluation.aspect_3_result,
        aspect_4_result=evaluation.aspect_4_result,
        created_at=evaluation.created_at,
        updated_at=evaluation.updated_at,
    )


def therapy_session_to_read(session: models.TherapySession) -> schemas.TherapySessionRead:
    slot = session.availability_slot
    return schemas.TherapySessionRead(
        id=session.id,
        kid_id=session.kid_id,
        caregiver_id=session.caregiver_id,
        case_manager_id=session.case_manager_id,
        availability_slot_id=session.availability_slot_id,
        status=session.status.value,
        scheduled_date=slot.available_date,
        scheduled_start_time=slot.start_time,
        scheduled_end_time=slot.end_time,
        has_denver_evaluation=session.denver_evaluation is not None,
    )

