from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.db.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

def get_creds(user: User):
    if not user.calendar_token:
        return None
    with open(os.path.join(os.path.dirname(__file__), "../../credentials.json")) as f:
        import json
        c = json.load(f)["web"]
    return Credentials(
        token=user.calendar_token,
        refresh_token=user.calendar_refresh_token,
        token_uri=c["token_uri"],
        client_id=c["client_id"],
        client_secret=c["client_secret"],
        scopes=["https://www.googleapis.com/auth/calendar.readonly"]
    )

@router.get("/calendar/events")
def get_calendar_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    creds = get_creds(current_user)
    if not creds:
        raise HTTPException(status_code=401, detail="Calendar not connected")

    service = build("calendar", "v3", credentials=creds)
    now = datetime.now(timezone.utc).isoformat()

    events_result = service.events().list(
        calendarId="primary",
        timeMin=now,
        maxResults=15,
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    return [
        {
            "title": e.get("summary", "No title"),
            "start": e["start"].get("dateTime", e["start"].get("date")),
            "end": e["end"].get("dateTime", e["end"].get("date")),
            "location": e.get("location", ""),
            "description": e.get("description", "")
        }
        for e in events_result.get("items", [])
    ]
