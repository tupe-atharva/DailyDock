from fastapi import FastAPI
from app.db.database import Base, engine
from app.api import weather, shuttle, dining
from app.models import weather as weather_model
from app.models import shuttle as shuttle_model
from app.models import dining as dining_model

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DailyDock API")

app.include_router(weather.router, prefix="/api")
app.include_router(shuttle.router, prefix="/api")
app.include_router(dining.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "DailyDock API is running"}
