"""Create the single FinFlow administrator account.

For a fresh deployment the application can also create this account
automatically from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD.
"""
import argparse
import getpass
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.models.user import User


def main() -> None:
    parser = argparse.ArgumentParser(description="Create the single FinFlow administrator account")
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    args = parser.parse_args()

    password = getpass.getpass("Admin password: ")
    confirmation = getpass.getpass("Confirm admin password: ")
    if password != confirmation:
        raise SystemExit("Passwords do not match")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).filter(User.role == "ADMIN").count() > 0:
            raise SystemExit("An administrator already exists. FinFlow supports exactly one administrator.")

        email = args.email.strip().lower()
        if db.query(User).filter(User.email == email).first():
            raise SystemExit("A user with this email already exists")

        admin = User(
            id=str(__import__("uuid").uuid4()),
            name=args.name.strip(),
            email=email,
            password_hash=hash_password(password),
            role="ADMIN",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Administrator created: {admin.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
