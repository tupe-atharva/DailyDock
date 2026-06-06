from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.scrapers.weather import scrape_weather
from app.models.weather import Weather

router = APIRouter()

@router.get("/weather")
def get_weather(db: Session = Depends(get_db)):
    weather = scrape_weather(db)
    return {
        "temperature": weather.temperature,
        "feels_like": weather.feels_like,
        "description": weather.description,
        "humidity": weather.humidity,
        "wind_speed": weather.wind_speed,
        "fetched_at": weather.fetched_at
    }
