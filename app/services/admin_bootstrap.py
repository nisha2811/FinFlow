"""Bootstrap the single FinFlow administrator account.

The administrator is never exposed through public registration. On a fresh
database the account is created from ADMIN_* settings. If an administrator
already exists, no additional administrator is created.
"""
import uuid
import logging
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User

logger = logging.getLogger(__name__)


def ensure_single_admin(db: Session) -> User | None:
    admins = (
        db.query(User)
        .filter(User.role == "ADMIN")
        .order_by(User.id)
        .all()
    )

    if admins:
        # Repair legacy databases if multiple admin rows existed before the
        # single-admin constraint was introduced. Keep the first active admin
        # and deactivate any additional admin accounts.
        primary = admins[0]
        if not primary.is_active:
            primary.is_active = True

        for duplicate in admins[1:]:
            duplicate.is_active = False
            duplicate.role = "EMPLOYEE"

        db.commit()
        return primary

    admin = User(
        id=str(uuid.uuid4()),
        name=settings.ADMIN_NAME.strip(),
        email=settings.ADMIN_EMAIL.strip().lower(),
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        role="ADMIN",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    logger.info("FinFlow bootstrap administrator created: %s", admin.email)
    return admin
