from database import engine
import models

print("Attempting to connect to PostgreSQL and create tables...")

try:
    models.Base.metadata.create_all(bind=engine)
    print("SUCCESS! The tables were created.")
except Exception as e:
    print("\n--- WE FOUND AN ERROR ---")
    print(e)