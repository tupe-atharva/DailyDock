import requests
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.models.weather import Weather

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
CITY = "Binghamton"
URL = f"http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=imperial"

def scrape_weather(db: Session):
    response = requests.get(URL)
    data = response.json()

    weather = Weather(
        temperature=data["main"]["temp"],
        feels_like=data["main"]["feels_like"],
        description=data["weather"][0]["description"],
        humidity=data["main"]["humidity"],
        wind_speed=data["wind"]["speed"]
    )

    db.add(weather)
    db.commit()
    db.refresh(weather)
    return weather
