# backend/app/routers/users.py
from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase import supabase
from app.services.jwt import verify_token

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
    except Exception as _:
        raise HTTPException(status_code=404, detail="User not found")
    
@router.patch("/me")
async def update_user(data: dict, user=Depends(verify_token)):
    user_id = user["sub"]

    update_data = {}

    if "username" in data:
        update_data["username"] = data["username"]

    if "bio" in data:
        update_data["bio"] = data["bio"]

    if "avatar_url" in data:
        update_data["avatar_url"] = data["avatar_url"]

    response = (
        supabase.table("users")
        .update(update_data)
        .eq("id", user_id)
        .execute()
    )

    return {"user": response.data[0]}