"""add manager assignments

Revision ID: b61d6a2c4f7e
Revises: 6a8b5b69b976
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b61d6a2c4f7e"
down_revision: Union[str, Sequence[str], None] = "6a8b5b69b976"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("manager_id", sa.String(), nullable=True))
        batch_op.create_foreign_key(
            "fk_users_manager_id_users",
            "users",
            ["manager_id"],
            ["id"],
        )
        batch_op.create_index("ix_users_manager_id", ["manager_id"])


def downgrade() -> None:
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_index("ix_users_manager_id")
        batch_op.drop_constraint("fk_users_manager_id_users", type_="foreignkey")
        batch_op.drop_column("manager_id")
