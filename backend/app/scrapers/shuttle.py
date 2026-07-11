
import requests
from sqlalchemy.orm import Session
from app.models.shuttle import Shuttle

VEHICLES_URL = "https://binghamtonupublic.etaspot.net/service.php?service=get_vehicles&includeETAData=1&orderedETAArray=1&token=TESTING"
PATTERNS_URL = "https://binghamtonupublic.etaspot.net/service.php?service=get_patterns&token=TESTING"

HEADERS = {"User-Agent": "Mozilla/5.0"}

def get_route_names():
    r = requests.get(PATTERNS_URL, headers=HEADERS)
    patterns = r.json().get("get_patterns", [])
    route_map = {}
    for p in patterns:
        for route_id in p.get("routes", []):
            if route_id not in route_map:
                route_map[route_id] = p.get("name", f"Route {route_id}")
    return route_map

def scrape_shuttles(db: Session):
    route_names = get_route_names()
    response = requests.get(VEHICLES_URL, headers=HEADERS)
    vehicles = response.json().get("get_vehicles", [])

    db.query(Shuttle).delete()

    shuttles = []
    for v in vehicles:
        next_stop = v.get("minutesToNextStops", [{}])[0] if v.get("minutesToNextStops") else {}
        route_id = v["routeID"]
        shuttle = Shuttle(
            route_id=route_id,
            equipment_id=v["equipmentID"],
            lat=v["lat"],
            lng=v["lng"],
            next_stop_id=v.get("nextStopID"),
            minutes_to_next_stop=next_stop.get("minutes"),
            next_stop_time=next_stop.get("time"),
            in_service=v.get("inService", 0)
        )
        db.add(shuttle)
        shuttles.append((shuttle, route_names.get(route_id, f"Route {route_id}")))

    db.commit()
    return shuttles
