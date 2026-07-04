
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api import weather, shuttle, dining, schedule
from app.models import weather as weather_model
from app.models import shuttle as shuttle_model
from app.models import dining as dining_model
from app.models import schedule as schedule_model

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DailyDock API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router, prefix="/api")
app.include_router(shuttle.router, prefix="/api")
app.include_router(dining.router, prefix="/api")
app.include_router(schedule.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "DailyDock API is running"}
