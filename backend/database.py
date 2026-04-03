import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load the environment variables
load_dotenv()

# Grab the Supabase URL from your .env file
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create the engine (Notice we removed the SQLite-specific check_same_thread logic!)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()