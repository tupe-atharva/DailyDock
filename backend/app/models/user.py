from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(100), unique=True, nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    picture = Column(String(500), nullable=True)
    calendar_token = Column(Text, nullable=True)
    calendar_refresh_token = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
