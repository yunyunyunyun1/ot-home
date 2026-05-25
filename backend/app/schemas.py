from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import UserRole

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
