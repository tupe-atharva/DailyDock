
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

router = APIRouter()

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), "../../credentials.json")

token_store = {}

def get_flow():
    return Flow.from_client_secrets_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
        redirect_uri=os.getenv("GOOGLE_REDIRECT_URI")
    )

@router.get("/calendar/login")
def calendar_login():
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        prompt="consent",
        access_type="offline",
        include_granted_scopes="true"
    )
    token_store["state"] = state
    token_store["flow"] = flow
    return RedirectResponse(auth_url)

@router.get("/calendar/callback")
def calendar_callback(request: Request, code: str, state: str):
    flow = token_store.get("flow")
    if not flow:
        flow = get_flow()
    
    authorization_response = str(request.url)
    flow.fetch_token(authorization_response=authorization_response)
    
    creds = flow.credentials
    token_store["credentials"] = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": list(creds.scopes)
    }
    return RedirectResponse("http://localhost:5173")

@router.get("/calendar/events")
def get_calendar_events():
    if "credentials" not in token_store:
        return {"error": "not_authenticated", "login_url": "http://localhost:8000/api/calendar/login"}

    creds_data = token_store["credentials"]
    creds = Credentials(
        token=creds_data["token"],
        refresh_token=creds_data["refresh_token"],
        token_uri=creds_data["token_uri"],
        client_id=creds_data["client_id"],
        client_secret=creds_data["client_secret"],
        scopes=creds_data["scopes"]
    )

    service = build("calendar", "v3", credentials=creds)
    now = datetime.now(timezone.utc).isoformat()

    events_result = service.events().list(
        calendarId="primary",
        timeMin=now,
        maxResults=10,
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    events = events_result.get("items", [])

    return [
        {
            "title": e.get("summary", "No title"),
            "start": e["start"].get("dateTime", e["start"].get("date")),
            "end": e["end"].get("dateTime", e["end"].get("date")),
            "location": e.get("location", ""),
            "description": e.get("description", "")
        }
        for e in events
    ]
