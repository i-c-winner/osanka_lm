"""initial

Revision ID: 1858cc466a95
Revises:
Create Date: 2026-05-25 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from alembic import op

revision: str = "1858cc466a95"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS auth")
    op.execute("CREATE SCHEMA IF NOT EXISTS offline")
    op.execute("CREATE SCHEMA IF NOT EXISTS online")
    op.execute("CREATE SCHEMA IF NOT EXISTS billing")

    # --- auth.users ---
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("telegram_id", sa.String(), nullable=False),
        sa.Column("telegram_username", sa.String(), nullable=True),
        sa.Column("first_name", sa.String(), nullable=True),
        sa.Column("last_name", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("language_code", sa.String(10), nullable=True),
        sa.Column("timezone", sa.String(64), nullable=True),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.UniqueConstraint("telegram_id", name="uq_users_telegram_id"),
        schema="auth",
    )
    op.create_index("ix_auth_users_telegram_id", "users", ["telegram_id"], unique=True, schema="auth")

    # --- auth.roles ---
    op.create_table(
        "roles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("role", name="uq_roles_role"),
        schema="auth",
    )
    op.create_index("ix_auth_roles_role", "roles", ["role"], unique=True, schema="auth")

    # --- auth.permissions ---
    op.create_table(
        "permissions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("code", name="uq_permissions_code"),
        schema="auth",
    )
    op.create_index("ix_auth_permissions_code", "permissions", ["code"], unique=True, schema="auth")

    # --- public.locations ---
    op.create_table(
        "locations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("timezone", sa.String(64), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # --- offline.days ---
    op.create_table(
        "days",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("location_id", UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(64), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        schema="offline",
    )
    op.create_index("ix_offline_days_date", "days", ["date"], schema="offline")

    # --- offline.sessions ---
    op.create_table(
        "sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("day_id", UUID(as_uuid=True), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("trainer_id", UUID(as_uuid=True), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("class_type_id", UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(64), nullable=False),
        schema="offline",
    )
    op.create_index("ix_offline_sessions_day_id", "sessions", ["day_id"], schema="offline")
    op.create_index("ix_offline_sessions_trainer_id", "sessions", ["trainer_id"], schema="offline")
    op.create_index("ix_offline_sessions_class_type_id", "sessions", ["class_type_id"], schema="offline")

    # --- offline.bookings ---
    op.create_table(
        "bookings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("session_id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(64), nullable=False),
        sa.Column("booked_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        schema="offline",
    )
    op.create_index("ix_offline_bookings_session_id", "bookings", ["session_id"], schema="offline")
    op.create_index("ix_offline_bookings_user_id", "bookings", ["user_id"], schema="offline")

    # --- offline.attendance ---
    op.create_table(
        "attendance",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("booking_id", UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(64), nullable=False),
        sa.Column("marked_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("marked_by", UUID(as_uuid=True), nullable=True),
        schema="offline",
    )
    op.create_index("ix_offline_attendance_booking_id", "attendance", ["booking_id"], schema="offline")

    # --- billing.subscription_plans ---
    op.create_table(
        "subscription_plans",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sessions_limit", sa.Integer(), nullable=True),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("code", name="uq_subscription_plans_code"),
        schema="billing",
    )
    op.create_index("ix_billing_subscription_plans_code", "subscription_plans", ["code"], unique=True, schema="billing")

    # --- billing.subscriptions ---
    op.create_table(
        "subscriptions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("plan_id", UUID(as_uuid=True), nullable=False),
        sa.Column("sessions_used", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(64), nullable=False),
        schema="billing",
    )
    op.create_index("ix_billing_subscriptions_user_id", "subscriptions", ["user_id"], schema="billing")
    op.create_index("ix_billing_subscriptions_plan_id", "subscriptions", ["plan_id"], schema="billing")


def downgrade() -> None:
    op.drop_table("subscriptions", schema="billing")
    op.drop_table("subscription_plans", schema="billing")
    op.drop_table("attendance", schema="offline")
    op.drop_table("bookings", schema="offline")
    op.drop_table("sessions", schema="offline")
    op.drop_table("days", schema="offline")
    op.drop_table("locations")
    op.drop_table("permissions", schema="auth")
    op.drop_table("roles", schema="auth")
    op.drop_table("users", schema="auth")
    op.execute("DROP SCHEMA IF EXISTS billing")
    op.execute("DROP SCHEMA IF EXISTS online")
    op.execute("DROP SCHEMA IF EXISTS offline")
    op.execute("DROP SCHEMA IF EXISTS auth")
