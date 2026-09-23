import json
import uuid

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def record_audit(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    user_id: str | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
) -> None:
    db.add(
        AuditLog(
            id=str(uuid.uuid4()),
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            details=json.dumps(details or {}),
            ip_address=ip_address,
        )
    )