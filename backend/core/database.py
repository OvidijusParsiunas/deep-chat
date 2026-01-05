"""
Database initialization and session management
Uses SQLAlchemy with SQLite for simplicity
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pathlib import Path
from backend.core.config import get_settings

# Create Base class for models
Base = declarative_base()

# Global engine and session factory
_engine = None
_SessionLocal = None


def get_engine():
    """Get or create database engine"""
    global _engine

    if _engine is None:
        settings = get_settings()

        # Ensure data directory exists
        db_url = settings.database.url
        if db_url.startswith("sqlite:///"):
            db_path = Path(db_url.replace("sqlite:///", ""))
            db_path.parent.mkdir(parents=True, exist_ok=True)

        _engine = create_engine(
            settings.database.url,
            connect_args={"check_same_thread": False} if "sqlite" in db_url else {},
            echo=settings.database.echo
        )

    return _engine


def get_session_factory():
    """Get or create session factory"""
    global _SessionLocal

    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    return _SessionLocal


def get_db() -> Session:
    """
    Dependency function to get database session
    Use with FastAPI Depends()

    Yields:
        Session: SQLAlchemy database session
    """
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables
    Creates all tables defined in models
    """
    # Import models to register them with Base
    from backend.models import user, chat  # noqa: F401

    engine = get_engine()
    Base.metadata.create_all(bind=engine)


def reset_db():
    """
    Drop and recreate all tables
    WARNING: This deletes all data!
    """
    from backend.models import user, chat  # noqa: F401

    engine = get_engine()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
