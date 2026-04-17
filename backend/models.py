from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base 

class TierEnum(str, enum.Enum):
    STARTER = "Starter"
    PREMIUM = "Premium"
    ULTRA = "Ultra"

class ModeEnum(str, enum.Enum):
    PRE_LAUNCH = "Pre-Launch"
    POST_LAUNCH = "Post-Launch"

class User(Base):
    # 👇 MAGIC TRICK: Bumped to v2 to force a fresh table 👇
    __tablename__ = "users_v2"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    subscription_tier = Column(Enum(TierEnum), default=TierEnum.STARTER)
    evaluations_count = Column(Integer, default=0) 
    created_at = Column(DateTime, default=datetime.utcnow)

    evaluations = relationship("Evaluation", back_populates="owner")

class Evaluation(Base):
    # 👇 MAGIC TRICK: Bumped to v5 to match the new users table 👇
    __tablename__ = "evaluations_v5"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True) 
    # 👇 FIXED: Pointing to the new users_v2 table 👇
    user_id = Column(Integer, ForeignKey("users_v2.id"), nullable=True) 
    startup_name = Column(String, index=True)
    
    evaluation_mode = Column(Enum(ModeEnum)) 
    input_type = Column(String) 
    source_url = Column(String, nullable=True) 
    
    technical_readiness_score = Column(Float)
    business_viability_score = Column(Float)
    innovation_index_score = Column(Float)
    financial_sustainability_score = Column(Float)
    overall_viability_score = Column(Float) 
    
    # --- NEW AI DATA COLUMNS ---
    key_strengths = Column(Text, default="[]") 
    priority_actions = Column(Text, default="[]")
    strategic_opportunities = Column(Text, default="[]")
    # ---------------------------
    
    ai_feedback_json = Column(Text) 
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="evaluations")