from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title = "SyncStream API",
    description = "Backend for SyncStream - watch party + social app",
    version = "0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL ", "https://syncstreampwa.vercel.app/"),
    ],
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*'],
)

app.include_router(users.router) #Add this after middleware

@app.get('/')
async def health_check(): 
    return {"status": "ok", "app": "SyncStream API", "version": "0.1.0"}

@app.get('/health')
async def health():
    return {"healthy": True}
