from datetime import date, datetime, time
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, Time, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(StrEnum):
    ADMIN = "admin"
    PARENT = "parent"
    CASE_MANAGER = "case_manager"
    CAREGIVER = "caregiver"
    VILLAGE_VOLUNTEER = "village_volunteer"


class DenverAspectResult(StrEnum):
    PASS = "pass"
    FAIL = "fail"


class TherapySessionStatus(StrEnum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


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
    created_kids: Mapped[list["Kid"]] = relationship(back_populates="created_by_case_manager")
    caregiver_assignments: Mapped[list["CaregiverKidAssignment"]] = relationship(
        back_populates="caregiver",
        foreign_keys="CaregiverKidAssignment.caregiver_id",
    )
    village_volunteer_assignments: Mapped[list["VillageVolunteerKidAssignment"]] = relationship(
        back_populates="village_volunteer",
        foreign_keys="VillageVolunteerKidAssignment.village_volunteer_id",
    )
    availability_slots: Mapped[list["CaregiverAvailabilitySlot"]] = relationship(
        back_populates="caregiver",
        cascade="all, delete-orphan",
    )
    therapy_sessions: Mapped[list["TherapySession"]] = relationship(
        back_populates="caregiver",
        foreign_keys="TherapySession.caregiver_id",
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


class Kid(Base):
    __tablename__ = "kids"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    thai_id: Mapped[str] = mapped_column(String(13), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"), nullable=False)
    created_by_case_manager_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
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

    address: Mapped[Address] = relationship()
    created_by_case_manager: Mapped[User] = relationship(back_populates="created_kids")
    caregiver_assignment: Mapped["CaregiverKidAssignment | None"] = relationship(
        back_populates="kid",
        cascade="all, delete-orphan",
        uselist=False,
    )
    village_volunteer_assignments: Mapped[list["VillageVolunteerKidAssignment"]] = relationship(
        back_populates="kid",
        cascade="all, delete-orphan",
    )
    denver_evaluations: Mapped[list["DenverEvaluation"]] = relationship(
        back_populates="kid",
        cascade="all, delete-orphan",
    )
    home_program_activities: Mapped[list["HomeProgramActivity"]] = relationship(
        back_populates="kid",
        cascade="all, delete-orphan",
    )
    therapy_sessions: Mapped[list["TherapySession"]] = relationship(
        back_populates="kid",
        cascade="all, delete-orphan",
    )


class TherapySession(Base):
    __tablename__ = "therapy_sessions"
    __table_args__ = (UniqueConstraint("availability_slot_id"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    kid_id: Mapped[UUID] = mapped_column(ForeignKey("kids.id"), nullable=False)
    caregiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    case_manager_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    availability_slot_id: Mapped[UUID] = mapped_column(
        ForeignKey("caregiver_availability_slots.id"),
        nullable=False,
    )
    status: Mapped[TherapySessionStatus] = mapped_column(
        Enum(TherapySessionStatus),
        default=TherapySessionStatus.SCHEDULED,
        nullable=False,
    )
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

    kid: Mapped[Kid] = relationship(back_populates="therapy_sessions")
    caregiver: Mapped[User] = relationship(
        back_populates="therapy_sessions",
        foreign_keys=[caregiver_id],
    )
    case_manager: Mapped[User] = relationship(foreign_keys=[case_manager_id])
    availability_slot: Mapped["CaregiverAvailabilitySlot"] = relationship(
        back_populates="therapy_session",
    )
    denver_evaluation: Mapped["DenverEvaluation | None"] = relationship(
        back_populates="therapy_session",
        uselist=False,
    )


class DenverEvaluation(Base):
    __tablename__ = "denver_evaluations"
    __table_args__ = (
        UniqueConstraint("kid_id", "evaluation_name"),
        UniqueConstraint("availability_slot_id"),
        UniqueConstraint("therapy_session_id"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    kid_id: Mapped[UUID] = mapped_column(ForeignKey("kids.id"), nullable=False)
    evaluated_by_caregiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    therapy_session_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("therapy_sessions.id"),
        nullable=True,
    )
    assignment_id: Mapped[UUID] = mapped_column(
        ForeignKey("caregiver_kid_assignments.id"),
        nullable=False,
    )
    availability_slot_id: Mapped[UUID] = mapped_column(
        ForeignKey("caregiver_availability_slots.id"),
        nullable=False,
    )
    evaluation_name: Mapped[str] = mapped_column(String(80), nullable=False)
    aspect_1_result: Mapped[DenverAspectResult] = mapped_column(
        Enum(DenverAspectResult),
        nullable=False,
    )
    aspect_2_result: Mapped[DenverAspectResult] = mapped_column(
        Enum(DenverAspectResult),
        nullable=False,
    )
    aspect_3_result: Mapped[DenverAspectResult] = mapped_column(
        Enum(DenverAspectResult),
        nullable=False,
    )
    aspect_4_result: Mapped[DenverAspectResult] = mapped_column(
        Enum(DenverAspectResult),
        nullable=False,
    )
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

    kid: Mapped[Kid] = relationship(back_populates="denver_evaluations")
    evaluated_by_caregiver: Mapped[User] = relationship(foreign_keys=[evaluated_by_caregiver_id])
    therapy_session: Mapped["TherapySession | None"] = relationship(
        back_populates="denver_evaluation",
    )
    assignment: Mapped["CaregiverKidAssignment"] = relationship()
    availability_slot: Mapped["CaregiverAvailabilitySlot"] = relationship()
    home_program_activities: Mapped[list["HomeProgramActivity"]] = relationship(
        back_populates="evaluation",
        cascade="all, delete-orphan",
    )


class HomeProgramActivity(Base):
    __tablename__ = "home_program_activities"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    kid_id: Mapped[UUID] = mapped_column(ForeignKey("kids.id"), nullable=False)
    caregiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    evaluation_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("denver_evaluations.id"),
        nullable=True,
    )
    aspect: Mapped[str] = mapped_column(String(80), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    instruction: Mapped[str] = mapped_column(Text, nullable=False)
    frequency: Mapped[str | None] = mapped_column(String(160), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
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

    kid: Mapped[Kid] = relationship(back_populates="home_program_activities")
    caregiver: Mapped[User] = relationship(foreign_keys=[caregiver_id])
    evaluation: Mapped[DenverEvaluation | None] = relationship(
        back_populates="home_program_activities",
    )


class CaregiverKidAssignment(Base):
    __tablename__ = "caregiver_kid_assignments"
    __table_args__ = (
        UniqueConstraint("kid_id"),
        UniqueConstraint("availability_slot_id"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    kid_id: Mapped[UUID] = mapped_column(ForeignKey("kids.id"), nullable=False)
    caregiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    assigned_by_case_manager_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    availability_slot_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("caregiver_availability_slots.id"),
        nullable=True,
    )
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

    kid: Mapped[Kid] = relationship(back_populates="caregiver_assignment")
    caregiver: Mapped[User] = relationship(
        back_populates="caregiver_assignments",
        foreign_keys=[caregiver_id],
    )
    assigned_by_case_manager: Mapped[User] = relationship(foreign_keys=[assigned_by_case_manager_id])
    availability_slot: Mapped["CaregiverAvailabilitySlot | None"] = relationship(
        back_populates="assignment",
    )


class VillageVolunteerKidAssignment(Base):
    __tablename__ = "village_volunteer_kid_assignments"
    __table_args__ = (
        UniqueConstraint(
            "kid_id",
            "village_volunteer_id",
            name="uq_village_volunteer_kid_assignments_pair",
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    kid_id: Mapped[UUID] = mapped_column(ForeignKey("kids.id"), nullable=False)
    village_volunteer_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    assigned_by_case_manager_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
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

    kid: Mapped[Kid] = relationship(back_populates="village_volunteer_assignments")
    village_volunteer: Mapped[User] = relationship(
        back_populates="village_volunteer_assignments",
        foreign_keys=[village_volunteer_id],
    )
    assigned_by_case_manager: Mapped[User] = relationship(foreign_keys=[assigned_by_case_manager_id])


class CaregiverAvailabilitySlot(Base):
    __tablename__ = "caregiver_availability_slots"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    caregiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    available_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    caregiver: Mapped[User] = relationship(back_populates="availability_slots")
    assignment: Mapped[CaregiverKidAssignment | None] = relationship(
        back_populates="availability_slot",
        uselist=False,
    )
    therapy_session: Mapped[TherapySession | None] = relationship(
        back_populates="availability_slot",
        uselist=False,
    )
