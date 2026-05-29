from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.security import get_password_hash


def mask_thai_id(thai_id: str) -> str:
    return f"{thai_id[:4]}*****{thai_id[-4:]}"


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
