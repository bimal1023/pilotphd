from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from .models import application, user  # noqa: F401 — ensures models are registered
    Base.metadata.create_all(bind=engine)
    _run_migrations()


def _run_migrations():
    with engine.connect() as conn:
        # Add user_id column if missing
        conn.execute(text(
            "ALTER TABLE applications ADD COLUMN IF NOT EXISTS "
            "user_id INTEGER REFERENCES users(id) ON DELETE CASCADE"
        ))
        # Drop orphaned rows (no user_id) so we can enforce NOT NULL
        conn.execute(text(
            "DELETE FROM applications WHERE user_id IS NULL"
        ))
        # Enforce NOT NULL now that orphans are gone
        conn.execute(text(
            "ALTER TABLE applications ALTER COLUMN user_id SET NOT NULL"
        ))
        # Add token_version column if missing
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0"
        ))
        conn.commit()
