import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, auth

load_dotenv()

app = FastAPI(
    title = "SyncStream API",
    description = "Backend for SyncStream - watch party + social app",
    version = "0.1.0"
)
# Production origin (Vercel)
frontend_url = os.getenv("FRONTEND_URL", "")

# Extra origins — comma separated, for dev Codespaces URLs
# e.g. EXTRA_ORIGINS=https://laughing-robot-xyz-5173.app.github.dev
extra_origins = os.getenv("EXTRA_ORIGINS", "").split(",")

allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "http://localhost:5173",
    *extra_origins,
]

# Remove empty strings
allowed_origins = [o.strip() for o in allowed_origins if o.strip()]

print(f"CORS allowed origins: {allowed_origins}")  # visible in Render logs

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
async def health_check():
    return {"status": "ok", "app": "SyncStream API", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"healthy": True}