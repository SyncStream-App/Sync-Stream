# backend/app/services/supabase.py — correct import order
import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")

# Service client — has full DB access, backend only, never expose to frontend
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
