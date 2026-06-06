from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float, nullable=False)
    feels_like = Column(Float, nullable=False)
    description = Column(String(100), nullable=False)
    humidity = Column(Integer, nullable=False)
    wind_speed = Column(Float, nullable=False)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
