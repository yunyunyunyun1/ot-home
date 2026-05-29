from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(StrEnum):
    ADMIN = "admin"
    PARENT = "parent"
    CASE_MANAGER = "case_manager"
    CAREGIVER = "caregiver"
    VILLAGE_VOLUNTEER = "village_volunteer"


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    thai_id: Mapped[str] = mapped_column(String(13), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    parent_profile: Mapped["ParentProfile | None"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    case_manager_profile: Mapped["CaseManagerProfile | None"] = relationship(
        back_populates="user",
        foreign_keys="CaseManagerProfile.user_id",
        cascade="all, delete-orphan",
    )
    caregiver_profile: Mapped["CaregiverProfile | None"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    village_volunteer_profile: Mapped["VillageVolunteerProfile | None"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(primary_key=True)
    house_no: Mapped[str | None] = mapped_column(String(60), nullable=True)
    village_no: Mapped[str | None] = mapped_column(String(60), nullable=True)
    road: Mapped[str | None] = mapped_column(String(160), nullable=True)
    subdistrict: Mapped[str] = mapped_column(String(160), nullable=False)
    district: Mapped[str] = mapped_column(String(160), nullable=False)
    province: Mapped[str] = mapped_column(String(160), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(10), nullable=False)
    country: Mapped[str] = mapped_column(String(80), default="Thailand", nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)


class ParentProfile(Base):
    __tablename__ = "parent_profiles"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"), nullable=False)

    user: Mapped[User] = relationship(back_populates="parent_profile")
    address: Mapped[Address] = relationship()


class CaseManagerProfile(Base):
    __tablename__ = "case_manager_profiles"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"), nullable=False)
    created_by_admin_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    user: Mapped[User] = relationship(
        back_populates="case_manager_profile",
        foreign_keys=[user_id],
    )
    address: Mapped[Address] = relationship()
    created_by_admin: Mapped[User | None] = relationship(foreign_keys=[created_by_admin_id])


class CaregiverProfile(Base):
    __tablename__ = "caregiver_profiles"
    __table_args__ = (UniqueConstraint("license_id"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    license_id: Mapped[str] = mapped_column(String(80), nullable=False)
    hospital_or_clinic: Mapped[str] = mapped_column(String(200), nullable=False)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"), nullable=False)

    user: Mapped[User] = relationship(back_populates="caregiver_profile")
    address: Mapped[Address] = relationship()


class VillageVolunteerProfile(Base):
    __tablename__ = "village_volunteer_profiles"
    __table_args__ = (UniqueConstraint("license_id"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    license_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    hospital_or_clinic: Mapped[str] = mapped_column(String(200), nullable=False)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"), nullable=False)

    user: Mapped[User] = relationship(back_populates="village_volunteer_profile")
    address: Mapped[Address] = relationship()
