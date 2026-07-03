from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Shuttle(Base):
    __tablename__ = "shuttles"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, nullable=False)
    equipment_id = Column(String(20), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    next_stop_id = Column(Integer, nullable=True)
    minutes_to_next_stop = Column(Integer, nullable=True)
    next_stop_time = Column(String(20), nullable=True)
    in_service = Column(Integer, nullable=False)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
