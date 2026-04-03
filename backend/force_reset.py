from database import engine
import models
from sqlalchemy import text

print("Executing Hard Reset on PostgreSQL...")

try:
    with engine.connect() as conn:
        # The 'CASCADE' command forces Postgres to delete the table no matter what
        conn.execute(text("DROP TABLE IF EXISTS evaluations CASCADE;"))
        conn.commit()
        print("✅ Successfully wiped the old evaluations table!")
except Exception as e:
    print(f"❌ Error dropping table: {e}")

try:
    # Rebuild the table with the new columns
    models.Base.metadata.create_all(bind=engine)
    print("✅ Successfully created the new evaluations table with AI columns!")
except Exception as e:
    print(f"❌ Error creating table: {e}")