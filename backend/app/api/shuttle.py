from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.scrapers.shuttle import scrape_shuttles

router = APIRouter()

@router.get("/shuttles")
def get_shuttles(db: Session = Depends(get_db)):
    shuttles = scrape_shuttles(db)
    return [
        {
            "route_id": s.route_id,
            "equipment_id": s.equipment_id,
            "lat": s.lat,
            "lng": s.lng,
            "next_stop_id": s.next_stop_id,
            "minutes_to_next_stop": s.minutes_to_next_stop,
            "next_stop_time": s.next_stop_time,
            "in_service": s.in_service,
            "fetched_at": s.fetched_at
        }
        for s in shuttles
    ]
