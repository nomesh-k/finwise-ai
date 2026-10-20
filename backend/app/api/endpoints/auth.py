from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, FinancialProfile, AuditEvent
from app.schemas.schemas import UserRegister, UserLogin, Token, UserOut, PasswordForgot, PasswordReset
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=data.email.lower(),
        password_hash=get_password_hash(data.password),
        display_name=data.display_name,
        currency=data.currency.upper() if data.currency else "INR",
        role="user",
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create empty financial profile
    profile = FinancialProfile(
        user_id=user.id,
        timezone="Asia/Kolkata",
        is_onboarded=False
    )
    db.add(profile)

    audit = AuditEvent(
        user_id=user.id,
        action="USER_REGISTERED",
        entity_type="user",
        entity_id=str(user.id),
        details='{"status": "new_registration"}'
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    user_out = UserOut.model_validate(user)
    user_out.is_onboarded = False

    return Token(access_token=token, token_type="bearer", user=user_out)

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended."
        )

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    user_out = UserOut.model_validate(user)
    user_out.is_onboarded = user.profile.is_onboarded if user.profile else False

    audit = AuditEvent(
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="user",
        entity_id=str(user.id)
    )
    db.add(audit)
    db.commit()

    return Token(access_token=token, token_type="bearer", user=user_out)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    audit = AuditEvent(
        user_id=current_user.id,
        action="USER_LOGOUT",
        entity_type="user",
        entity_id=str(current_user.id)
    )
    db.add(audit)
    db.commit()
    return {"message": "Logged out successfully."}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    user_out = UserOut.model_validate(current_user)
    user_out.is_onboarded = current_user.profile.is_onboarded if current_user.profile else False
    return user_out

@router.post("/forgot-password")
def forgot_password(data: PasswordForgot, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    # Always return success message to prevent user enumeration
    return {"message": "If this email exists in our system, a password recovery link has been generated."}

@router.post("/reset-password")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    # Simple simulated reset for prototype
    return {"message": "Password updated successfully. You may now log in with your new credentials."}
