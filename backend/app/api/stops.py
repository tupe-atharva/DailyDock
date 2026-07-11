
from fastapi import APIRouter
import requests

router = APIRouter()

@router.get("/stops")
def get_stops():
    r = requests.get(
        "https://binghamtonupublic.etaspot.net/service.php?service=get_stops&token=TESTING",
        headers={"User-Agent": "Mozilla/5.0"}
    )
    stops = r.json().get("get_stops", [])
    seen = set()
    unique = []
    for s in stops:
        if s["id"] not in seen:
            seen.add(s["id"])
            unique.append({"id": s["id"], "name": s["name"], "lat": s["lat"], "lng": s["lng"]})
    return unique
