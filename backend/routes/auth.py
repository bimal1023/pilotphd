from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ..auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..config import settings
from ..database import get_db
from ..models.user import User
from ..schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
    VerifyEmailRequest,
)
from ..services.email import send_password_reset_email, send_verification_email

router = APIRouter()

VERIFICATION_TOKEN_TTL_HOURS = 24
RESET_TOKEN_TTL_HOURS = 1


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    token = User.generate_token()
    expires = datetime.now(timezone.utc) + timedelta(hours=VERIFICATION_TOKEN_TTL_HOURS)

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        verification_token=token,
        verification_token_expires_at=expires,
    )
    db.add(user)
    db.commit()

    await send_verification_email(user.email, user.name, token)
    return {"message": "Account created. Please check your email to verify your account."}


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == payload.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link.")
    if user.verification_token_expires_at and user.verification_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification link has expired. Please request a new one.")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    db.commit()

    # Auto sign-in after verification
    token = create_access_token(user.id)
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )
    return {"message": "Email verified successfully.", "user": {"name": user.name, "email": user.email}}


@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in.")

    token = create_access_token(user.id)
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )
    return {"user": {"name": user.name, "email": user.email}}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("session")
    return {"message": "Signed out."}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    # Always return the same message to avoid email enumeration
    if not user:
        return {"message": "If that email is registered, you'll receive a reset link shortly."}

    token = User.generate_token()
    user.reset_token = token
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=RESET_TOKEN_TTL_HOURS)
    db.commit()

    await send_password_reset_email(user.email, user.name, token)
    return {"message": "If that email is registered, you'll receive a reset link shortly."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
    if user.reset_token_expires_at and user.reset_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    user.hashed_password = hash_password(payload.password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()
    return {"message": "Password updated successfully. You can now sign in."}


@router.post("/resend-verification")
async def resend_verification(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.is_verified:
        return {"message": "If that email is registered and unverified, we'll send a new link."}

    token = User.generate_token()
    user.verification_token = token
    user.verification_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=VERIFICATION_TOKEN_TTL_HOURS)
    db.commit()

    await send_verification_email(user.email, user.name, token)
    return {"message": "If that email is registered and unverified, we'll send a new link."}
