# backend/app/routers/users.py
from fastapi import APIRouter, HTTPException
from app.services.supabase import supabase

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def get_users():
    """Test endpoint — returns all users. Remove before production."""
    try:
        response = supabase.table("users").select("*").execute()
        return {"users": response.data, "count": len(response.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{username}")
async def get_user_by_username(username: str):
    """Get a user profile by username."""
    try:
        response = (
            supabase.table("users")
            .select("id, username, avatar_url, banner_url, bio, watch_hours, badges, created_at")
            .eq("username", username)
            .single()
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="User not found")