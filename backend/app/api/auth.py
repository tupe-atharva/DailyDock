
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from jose import jwt, JWTError
from app.db.database import get_db
from app.models.user import User
import os, json
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

load_dotenv()

router = APIRouter()

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/calendar.readonly"
]

JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret")
ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")

CLIENT_CONFIG = {
    "web": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [REDIRECT_URI],
    }
}

flow_store = {}

def make_jwt(user_id: int, email: str):
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode({"sub": str(user_id), "email": email, "exp": expire}, JWT_SECRET, algorithm=ALGORITHM)

def decode_jwt(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None

def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_flow():
    return Flow.from_client_config(
        CLIENT_CONFIG, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )

@router.get("/auth/login")
def login():
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        prompt="consent",
        access_type="offline",
        include_granted_scopes="true"
    )
    flow_store[state] = flow
    print(f"LOGIN: stored state={state}, flow_store keys={list(flow_store.keys())}")
    return RedirectResponse(auth_url)

@router.get("/auth/callback")
def auth_callback(request: Request, code: str, state: str, db: Session = Depends(get_db)):
    print(f"CALLBACK: received state={state}")
    print(f"CALLBACK: flow_store keys={list(flow_store.keys())}")
    print(f"CALLBACK: full URL={str(request.url)}")

    flow = flow_store.pop(state, None)
    if not flow:
        print("CALLBACK: flow not found, creating new flow")
        flow = get_flow()

    try:
        flow.fetch_token(authorization_response=str(request.url))
        print("CALLBACK: token fetched successfully")
    except Exception as e:
        print(f"CALLBACK ERROR fetching token: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=token_failed")

    creds = flow.credentials

    try:
        service = build("oauth2", "v2", credentials=creds)
        info = service.userinfo().get().execute()
        print(f"CALLBACK: got user info: {info.get('email')}")
    except Exception as e:
        print(f"CALLBACK ERROR getting user info: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=userinfo_failed")

    google_id = info["id"]
    email = info["email"]
    name = info.get("name", email)
    picture = info.get("picture", "")

    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = User(google_id=google_id, email=email, name=name, picture=picture)
        db.add(user)
    else:
        user.name = name
        user.picture = picture

    user.calendar_token = creds.token
    user.calendar_refresh_token = creds.refresh_token
    db.commit()
    db.refresh(user)

    token = make_jwt(user.id, user.email)
    print(f"CALLBACK: JWT created, redirecting to frontend")
    return RedirectResponse(f"{FRONTEND_URL}?token={token}")

@router.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "picture": current_user.picture
    }
