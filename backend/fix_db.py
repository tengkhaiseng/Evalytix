from database import engine
from sqlalchemy import text

print("Upgrading PostgreSQL Database...")

queries = [
    "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS key_strengths TEXT;",
    "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS priority_actions TEXT;",
    "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS strategic_opportunities TEXT;"
]

with engine.connect() as conn:
    for query in queries:
        try:
            conn.execute(text(query))
            conn.commit()
            print(f"✅ Success: {query}")
        except Exception as e:
            conn.rollback()
            print(f"⚠️ Skipped: {query} (Column may already exist)")

print("🎉 Database upgrade complete! You are ready to go.")