from datetime import date, datetime, time
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import DenverAspectResult, UserRole

ThaiId = Annotated[str, Field(min_length=13, max_length=13, pattern=r"^\d{13}$")]
StrongPassword = Annotated[str, Field(min_length=8, max_length=128)]


class AddressBase(BaseModel):
    house_no: str | None = Field(default=None, max_length=60)
    village_no: str | None = Field(default=None, max_length=60)
    road: str | None = Field(default=None, max_length=160)
    subdistrict: str = Field(min_length=1, max_length=160)
    district: str = Field(min_length=1, max_length=160)
    province: str = Field(min_length=1, max_length=160)
    postal_code: str = Field(min_length=5, max_length=10)
    country: str = Field(default="Thailand", min_length=1, max_length=80)
    note: str | None = None


class AddressCreate(AddressBase):
    pass


class AddressRead(AddressBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    thai_id: ThaiId
    full_name: str = Field(min_length=1, max_length=160)
    phone: str | None = Field(default=None, max_length=30)
    email: str | None = Field(default=None, max_length=255)


class PasswordMixin(BaseModel):
    password: StrongPassword

    @field_validator("password")
    @classmethod
    def validate_strong_password(cls, value: str) -> str:
        checks = [
            any(char.islower() for char in value),
            any(char.isupper() for char in value),
            any(char.isdigit() for char in value),
            any(not char.isalnum() for char in value),
        ]
        if not all(checks):
            raise ValueError(
                "Password must contain lowercase, uppercase, number, and special character"
            )
        return value


class ParentRegister(UserBase, PasswordMixin):
    address: AddressCreate


class ProfessionalRegister(UserBase, PasswordMixin):
    license_id: str = Field(min_length=1, max_length=80)
    hospital_or_clinic: str = Field(min_length=1, max_length=200)
    address: AddressCreate


class VillageVolunteerRegister(UserBase, PasswordMixin):
    hospital_or_clinic: str = Field(min_length=1, max_length=200)
    address: AddressCreate


class CaseManagerCreate(UserBase, PasswordMixin):
    address: AddressCreate


class UserRead(BaseModel):
    id: UUID
    thai_id_masked: str
    role: UserRole
    full_name: str
    phone: str | None
    email: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserWithAddressRead(UserRead):
    address: AddressRead


class LoginRequest(BaseModel):
    thai_id: ThaiId
    password: str = Field(min_length=1, max_length=128)


class TokenRead(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class KidCreate(BaseModel):
    thai_id: ThaiId
    full_name: str = Field(min_length=1, max_length=160)
    address: AddressCreate


class KidUpdate(BaseModel):
    full_name: str = Field(min_length=1, max_length=160)
    address: AddressCreate


class AssignedCaregiverRead(BaseModel):
    id: UUID
    full_name: str


class KidRead(BaseModel):
    id: UUID
    thai_id_masked: str
    full_name: str
    address: AddressRead
    assigned_caregiver: AssignedCaregiverRead | None
    created_by_case_manager_id: UUID
    created_at: datetime
    updated_at: datetime


class KidAssignmentCreate(BaseModel):
    kid_id: UUID
    caregiver_id: UUID
    availability_slot_id: UUID


class CaseManagerContextRead(BaseModel):
    province: str


class CaregiverAvailabilityCreate(BaseModel):
    available_date: date
    start_time: time
    end_time: time

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, value: time, info) -> time:
        start_time = info.data.get("start_time")
        if start_time is not None and value <= start_time:
            raise ValueError("End time must be after start time")
        return value


class CaregiverAvailabilityUpdate(CaregiverAvailabilityCreate):
    pass


class CaregiverAvailabilityRead(BaseModel):
    id: UUID
    available_date: date
    start_time: time
    end_time: time
    is_booked: bool
    assigned_kid_name: str | None = None


class CaregiverRead(BaseModel):
    id: UUID
    thai_id_masked: str
    full_name: str
    phone: str | None
    email: str | None
    license_id: str
    hospital_or_clinic: str
    address: AddressRead
    availability_slots: list[CaregiverAvailabilityRead] = []


class VillageVolunteerRead(BaseModel):
    id: UUID
    thai_id_masked: str
    full_name: str
    phone: str | None
    email: str | None
    license_id: str | None
    hospital_or_clinic: str
    address: AddressRead


class TherapySessionRead(BaseModel):
    id: UUID
    kid_id: UUID
    caregiver_id: UUID
    case_manager_id: UUID
    availability_slot_id: UUID
    status: str
    scheduled_date: date
    scheduled_start_time: time
    scheduled_end_time: time
    has_denver_evaluation: bool


class DenverEvaluationCreate(BaseModel):
    evaluation_name: str = Field(min_length=1, max_length=3, pattern=r"^\d{1,3}$")
    aspect_1_result: DenverAspectResult
    aspect_2_result: DenverAspectResult
    aspect_3_result: DenverAspectResult
    aspect_4_result: DenverAspectResult


class DenverEvaluationRead(DenverEvaluationCreate):
    id: UUID
    kid_id: UUID
    evaluated_by_caregiver_id: UUID
    therapy_session_id: UUID | None = None
    assignment_id: UUID | None = None
    availability_slot_id: UUID | None = None
    scheduled_date: date | None = None
    scheduled_start_time: time | None = None
    scheduled_end_time: time | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HomeProgramActivityCreate(BaseModel):
    evaluation_id: UUID | None = None
    aspect: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=160)
    instruction: str = Field(min_length=1)
    frequency: str | None = Field(default=None, max_length=160)
    note: str | None = None


class HomeProgramActivityRead(HomeProgramActivityCreate):
    id: UUID
    kid_id: UUID
    caregiver_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
