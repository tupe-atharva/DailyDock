
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api import weather, shuttle, dining, schedule, calendar, auth, stops
from app.models import weather as wm, shuttle as sm, dining as dm, schedule as scm, user as um
import os

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DailyDock API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(weather.router, prefix="/api")
app.include_router(shuttle.router, prefix="/api")
app.include_router(dining.router, prefix="/api")
app.include_router(schedule.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
app.include_router(stops.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "DailyDock API is running"}
