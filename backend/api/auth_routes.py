"""
Authentication routes for DGA Qiyas Copilot
Supports LDAP and local database authentication
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import jwt

from backend.core.config import get_settings
from backend.core.database import get_db
from backend.models.user import User

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()


class LoginRequest(BaseModel):
    """Login request model"""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response model"""
    status: str
    token: str
    user: dict


class RegisterRequest(BaseModel):
    """User registration request"""
    username: str
    password: str
    email: Optional[str] = None
    display_name: Optional[str] = None


def create_jwt_token(user_id: int, username: str) -> str:
    """
    Create JWT token for authenticated user

    Args:
        user_id: User database ID
        username: Username

    Returns:
        str: JWT token
    """
    settings = get_settings()

    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.utcnow() + timedelta(hours=settings.auth.jwt_expiration_hours),
        "iat": datetime.utcnow()
    }

    token = jwt.encode(
        payload,
        settings.auth.jwt_secret,
        algorithm=settings.auth.jwt_algorithm
    )

    return token


def verify_jwt_token(token: str) -> dict:
    """
    Verify JWT token and extract payload

    Args:
        token: JWT token string

    Returns:
        dict: Token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.auth.jwt_secret,
            algorithms=[settings.auth.jwt_algorithm]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user

    Args:
        credentials: Bearer token from request
        db: Database session

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    payload = verify_jwt_token(token)

    user = db.query(User).filter(User.id == payload["user_id"]).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


def authenticate_ldap(username: str, password: str) -> Optional[dict]:
    """
    Authenticate user against LDAP server

    Args:
        username: LDAP username
        password: User password

    Returns:
        Optional[dict]: User info dict if successful, None if failed
    """
    settings = get_settings()

    if not settings.auth.ldap.enabled:
        return None

    try:
        # LAZY IMPORT - Only import ldap3 when LDAP is enabled
        from ldap3 import Server, Connection, ALL, SIMPLE

        # Create LDAP server
        server = Server(
            settings.auth.ldap.server,
            port=settings.auth.ldap.port,
            use_ssl=settings.auth.ldap.use_ssl,
            get_info=ALL
        )

        # Build user DN from template
        user_dn = settings.auth.ldap.user_dn_template.format(username=username)

        # Attempt to bind with user credentials
        conn = Connection(
            server,
            user=user_dn,
            password=password,
            authentication=SIMPLE,
            auto_bind=True
        )

        if conn.bind():
            # Search for user info
            conn.search(
                search_base=settings.auth.ldap.base_dn,
                search_filter=f"(uid={username})",
                attributes=["mail", "displayName", "cn"]
            )

            user_info = {
                "username": username,
                "email": "",
                "display_name": username,
                "auth_source": "ldap"
            }

            if conn.entries:
                entry = conn.entries[0]
                user_info["email"] = str(entry.mail) if hasattr(entry, 'mail') else ""
                user_info["display_name"] = str(entry.displayName) if hasattr(entry, 'displayName') else username

            conn.unbind()
            return user_info

        return None

    except Exception as e:
        print(f"LDAP authentication error: {str(e)}")
        return None


def authenticate_local(username: str, password: str, db: Session) -> Optional[User]:
    """
    Authenticate user against local database

    Args:
        username: Username
        password: User password
        db: Database session

    Returns:
        Optional[User]: User object if successful, None if failed
    """
    user = db.query(User).filter(User.username == username).first()

    if not user:
        return None

    if not user.verify_password(password):
        return None

    return user


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint supporting both LDAP and local database authentication

    Flow:
    1. Try LDAP authentication (if enabled)
    2. If LDAP fails and local_db_fallback enabled, try local DB
    3. If LDAP disabled, use local DB
    4. Create/update user in local DB
    5. Generate JWT token
    """
    settings = get_settings()
    user = None
    user_info = None

    # Try LDAP authentication first
    if settings.auth.ldap.enabled:
        user_info = authenticate_ldap(request.username, request.password)

        if user_info:
            # LDAP authentication successful
            # Check if user exists in local DB, create if not
            user = db.query(User).filter(User.username == request.username).first()

            if not user:
                # Create new user from LDAP info
                user = User(
                    username=user_info["username"],
                    email=user_info["email"],
                    display_name=user_info["display_name"],
                    auth_source="ldap",
                    is_active=True
                )
                db.add(user)
            else:
                # Update user info from LDAP
                user.email = user_info["email"]
                user.display_name = user_info["display_name"]
                user.auth_source = "ldap"

            user.last_login = datetime.utcnow()
            db.commit()
            db.refresh(user)

    # Fallback to local DB authentication
    if not user and settings.auth.local_db_fallback:
        user = authenticate_local(request.username, request.password, db)

        if user:
            user.last_login = datetime.utcnow()
            db.commit()
            db.refresh(user)

    # If authentication failed
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Generate JWT token
    token = create_jwt_token(user.id, user.username)

    return LoginResponse(
        status="success",
        token=token,
        user=user.to_dict()
    )


@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new local user

    Note: Only works if local DB authentication is enabled
    LDAP users are auto-created on first login
    """
    settings = get_settings()

    if not settings.auth.local_db_fallback:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Local user registration is disabled"
        )

    # Check if username already exists
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Check if email already exists
    if request.email:
        existing_email = db.query(User).filter(User.email == request.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

    # Create new user
    user = User(
        username=request.username,
        email=request.email,
        display_name=request.display_name or request.username,
        auth_source="local",
        is_active=True
    )
    user.set_password(request.password)

    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_jwt_token(user.id, user.username)

    return {
        "status": "success",
        "message": "User registered successfully",
        "token": token,
        "user": user.to_dict()
    }


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user information"""
    return {
        "status": "success",
        "user": current_user.to_dict()
    }


@router.post("/logout")
async def logout():
    """
    Logout endpoint

    Note: JWT tokens are stateless, so logout is handled client-side
    by deleting the token. This endpoint is mainly for API consistency.
    """
    return {
        "status": "success",
        "message": "Logged out successfully"
    }
