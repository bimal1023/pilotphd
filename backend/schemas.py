from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from .models.application import ApplicationStatus


# ── Auth schemas ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ApplicationCreate(BaseModel):
    university: str
    program: str
    status: ApplicationStatus = ApplicationStatus.PLANNING
    deadline: Optional[date] = None
    applied_date: Optional[date] = None
    professors: list[str] = []
    research_interest: Optional[str] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    university: Optional[str] = None
    program: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    deadline: Optional[date] = None
    applied_date: Optional[date] = None
    professors: Optional[list[str]] = None
    research_interest: Optional[str] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    university: str
    program: str
    status: ApplicationStatus
    deadline: Optional[date]
    applied_date: Optional[date]
    professors: list[str]
    research_interest: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class EmailDraftRequest(BaseModel):
    professor_name: str
    university: str
    personal_statement: Optional[str] = None
    research_interest: Optional[str] = None


class FellowshipRequest(BaseModel):
    research_interest: str
    profile: str


class StatementRequest(BaseModel):
    personal_statement: str
