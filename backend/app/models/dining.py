from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class DiningItem(Base):
    __tablename__ = "dining_items"

    id = Column(Integer, primary_key=True, index=True)
    hall = Column(String(100), nullable=False)
    meal_period = Column(String(50), nullable=False)
    item_name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
