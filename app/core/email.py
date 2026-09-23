import logging
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from app.core.config import settings

logger = logging.getLogger("expense_management")

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


async def send_reset_email(email: str, reset_link: str) -> bool:
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning("Email settings are not configured; skipping password reset email.")
        return False

    try:
        message = MessageSchema(
            subject="FinFlow Password Reset Request",
            recipients=[email],
            body=f"""
            <html>
            <body style="
                margin:0;
                padding:10px;
                background:#F4F6F8;
                font-family:Arial, sans-serif;
            ">
                <div style="
                    max-width:900px;
                    margin:auto;
                    background:white;
                    border-radius:20px;
                    overflow:hidden;
                    box-shadow:0 10px 30px rgba(0,0,0,0.1);
                ">
                    <div style="
                        background:linear-gradient(135deg,#1B4332,#2D6A4F,#52B788);
                        padding:10px;
                        text-align:center;
                        color:white;
                    ">
                        <h1 style="margin:0; font-size:30px; font-weight:700;"><b>FinFlow</b></h1>
                        <p style="margin-top:10px; font-size:12px;">Expense Management Suite</p>
                    </div>

                    <div style="padding:20px;">
                        <p style="color:#555; line-height:1.8;">
                            We received a request to reset the password associated with your FinFlow account.
                        </p>
                        <p style="color:#555; line-height:1.8;">
                            Click the button below to create a new password.
                        </p>

                        <div style="text-align:center; margin:35px 0;">
                            <a href="{reset_link}" style="background:linear-gradient(135deg,#1B4332,#2D6A4F,#52B788); color:#ffffff; text-decoration:none; font-weight:700; font-size:12px; display:inline-block; padding:14px 28px; box-shadow:0 10px 25px rgba(45,106,79,0.35);">
                                Reset Password
                            </a>
                        </div>

                        <p style="color:#555; line-height:1.8;">
                            This password reset link will expire in <strong>15 minutes</strong>.
                        </p>
                        <p style="color:#555; line-height:1.8;">
                            If you did not request a password reset, please ignore this email.
                        </p>
                        <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;">
                        <p style="color:#777; font-size:14px; text-align:center;">FinFlow v1.0</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            subtype="html",
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return True
    except Exception as exc:
        logger.exception("Failed to send password reset email to %s: %s", email, exc)
        return False