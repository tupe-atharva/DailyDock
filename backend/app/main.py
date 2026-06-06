from fastapi import FastAPI
from app.db.database import Base, engine
from app.api import weather
from app.models import weather as weather_model

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DailyDock API")

app.include_router(weather.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "DailyDock API is running"}
