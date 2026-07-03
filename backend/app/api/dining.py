from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.scrapers.dining import scrape_dining

router = APIRouter()

@router.get("/dining")
def get_dining(db: Session = Depends(get_db)):
    items = scrape_dining(db)
    result = {}
    for item in items:
        if item.hall not in result:
            result[item.hall] = {}
        if item.meal_period not in result[item.hall]:
            result[item.hall][item.meal_period] = []
        result[item.hall][item.meal_period].append({
            "item_name": item.item_name,
            "category": item.category
        })
    return result
