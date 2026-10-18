import smtplib
from email.message import EmailMessage

from app.config import settings


def send_password_reset_otp(
    recipient_email: str,
    otp: str,
) -> None:
    if not settings.smtp_host:
        raise RuntimeError("SMTP is not configured.")

    if not settings.smtp_username:
        raise RuntimeError("SMTP username is not configured.")

    if not settings.smtp_password:
        raise RuntimeError("SMTP password is not configured.")

    sender_email = settings.smtp_from_email or settings.smtp_username

    message = EmailMessage()
    message["Subject"] = "Your ResuMatch AI Password Reset OTP"
    message["From"] = (
        f"{settings.smtp_from_name} <{sender_email}>"
    )
    message["To"] = recipient_email

    message.set_content(
        f"""Hello,

You requested to reset your ResuMatch AI password.

Your OTP is:

{otp}

This OTP is valid for 4 minutes.

If you did not request a password reset, you can safely ignore this email.

Do not share this OTP with anyone.

Regards,
ResuMatch AI
"""
    )

    with smtplib.SMTP(
        settings.smtp_host,
        settings.smtp_port,
        timeout=15,
    ) as server:
        if settings.smtp_use_tls:
            server.starttls()

        server.login(
            settings.smtp_username,
            settings.smtp_password,
        )

        server.send_message(message)