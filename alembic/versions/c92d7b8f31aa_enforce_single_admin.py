"""enforce a single administrator

Revision ID: c92d7b8f31aa
Revises: b61d6a2c4f7e
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "c92d7b8f31aa"
down_revision: Union[str, Sequence[str], None] = "b61d6a2c4f7e"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # The application bootstrap repairs legacy duplicate ADMIN rows before
    # this migration is normally applied. This partial unique index prevents
    # any future second administrator at the database level.
    op.create_index(
        "uq_users_single_admin",
        "users",
        ["role"],
        unique=True,
        sqlite_where=sa.text("role = 'ADMIN'"),
        postgresql_where=sa.text("role = 'ADMIN'"),
    )

def downgrade() -> None:
    op.drop_index("uq_users_single_admin", table_name="users")
