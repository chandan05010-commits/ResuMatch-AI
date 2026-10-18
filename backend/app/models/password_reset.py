from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database.session import Base


class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    otp_hash = Column(
        String(128),
        nullable=False
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    attempts = Column(
        Integer,
        nullable=False,
        default=0
    )

    max_attempts = Column(
        Integer,
        nullable=False,
        default=5
    )

    used = Column(
        Boolean,
        nullable=False,
        default=False
    )

    verified = Column(
        Boolean,
        nullable=False,
        default=False
    )

    verified_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )