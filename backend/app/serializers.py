from app import crud, models, schemas


def user_to_read(user: models.User) -> schemas.UserRead:
    return schemas.UserRead(
        id=user.id,
        thai_id_masked=crud.mask_thai_id(user.thai_id),
        role=user.role,
        full_name=user.full_name,
        phone=user.phone,
        email=user.email,
        is_active=user.is_active,
        created_at=user.created_at,
    )



