import requests
from sqlalchemy.orm import Session
from app.models.shuttle import Shuttle

URL = "https://binghamtonupublic.etaspot.net/service.php?service=get_vehicles&includeETAData=1&inService=1&orderedETAArray=1&token=TESTING"

def scrape_shuttles(db: Session):
    response = requests.get(URL, headers={"User-Agent": "Mozilla/5.0"})
    vehicles = response.json().get("get_vehicles", [])

    db.query(Shuttle).delete()

    shuttles = []
    for v in vehicles:
        next_stop = v.get("minutesToNextStops", [{}])[0] if v.get("minutesToNextStops") else {}
        shuttle = Shuttle(
            route_id=v["routeID"],
            equipment_id=v["equipmentID"],
            lat=v["lat"],
            lng=v["lng"],
            next_stop_id=v.get("nextStopID"),
            minutes_to_next_stop=next_stop.get("minutes"),
            next_stop_time=next_stop.get("time"),
            in_service=v.get("inService", 0)
        )
        db.add(shuttle)
        shuttles.append(shuttle)

    db.commit()
    return shuttles
