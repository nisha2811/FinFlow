from app.db.database import SessionLocal
from app.models.user import User

def main():
    db = SessionLocal()
    try:
        patterns = [
            "employee_%@test.com",
            "manager_%@test.com",
            "test@test.com",
            "test_%@test.com"
        ]
        total_deleted = 0
        for p in patterns:
            users = db.query(User).filter(User.email.like(p)).all()
            for u in users:
                db.delete(u)
                total_deleted += 1
        db.commit()
        print(f"Deleted {total_deleted} dummy users")
    finally:
        db.close()

if __name__ == "__main__":
    main()
