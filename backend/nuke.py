from database import engine
from sqlalchemy import text
import models

print("🚨 Initiating Nuclear Reset on the 'evaluations' table...")

try:
    with engine.connect() as conn:
        # Forcefully destroy the old table
        conn.execute(text("DROP TABLE IF EXISTS evaluations CASCADE;"))
        conn.commit()
        print("✅ Old table destroyed.")
except Exception as e:
    print(f"⚠️ Could not drop table: {e}")

try:
    # Rebuild the tables using your updated models.py
    models.Base.metadata.create_all(bind=engine)
    print("✅ New table built with all the correct AI columns!")
except Exception as e:
    print(f"❌ Failed to rebuild: {e}")