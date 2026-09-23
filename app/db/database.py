from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

def _create_engine(database_url: str):
    if database_url.startswith("sqlite"):
        return create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )

    engine = create_engine(database_url, pool_pre_ping=True)
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return engine


engine = _create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Import models after Base exists so metadata includes every table for migrations and startup.
from app.models.audit_log import AuditLog  # noqa: E402,F401
from app.models.expense import Expense  # noqa: E402,F401
from app.models.user import User  # noqa: E402,F401

def _ensure_local_schema() -> None:
    if not settings.AUTO_CREATE_TABLES or not settings.DATABASE_URL.startswith("sqlite"):
        return

    Base.metadata.create_all(bind=engine)
    columns = {column["name"] for column in inspect(engine).get_columns("users")}
    if "manager_id" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN manager_id VARCHAR"))

_ensure_local_schema()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()