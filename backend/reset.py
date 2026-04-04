from database import engine
import models

print("Starting database reset...")

try:
    # This deletes ONLY the evaluations table (so we don't delete your Users)
    models.Evaluation.__table__.drop(engine)
    print("Old evaluations table dropped successfully.")
except Exception as e:
    print(f"Table might not exist or error: {e}")

# This tells SQLAlchemy to rebuild any missing tables with the newest columns
models.Base.metadata.create_all(bind=engine)
print("New tables built successfully! You are ready to go.")