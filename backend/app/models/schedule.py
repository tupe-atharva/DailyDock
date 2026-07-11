from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class ClassSchedule(Base):
    __tablename__ = "class_schedule"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_name = Column(String(200), nullable=False)
    course_code = Column(String(50), nullable=False)
    professor = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    day_of_week = Column(String(20), nullable=False)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
