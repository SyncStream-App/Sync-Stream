from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase import supabase
from app.services.jwt import verify_token

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/check-username")
async def check_username(username: str):
    if len(username) < 3 or len(username) > 20:
        return {"available": False}

    if not username.replace("_", "").isalnum():
        return {"available": False}

    response = (
        supabase.table("users")
        .select("id")
        .eq("username", username)
        .execute()
    )

    return {"available": len(response.data) == 0}


@router.get("/{username}")
async def get_user_by_username(username: str):
    response = (
        supabase.table("users")
        .select("id, username, avatar_url, email, bio, created_at")
        .eq("username", username)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    return response.data   # ✅ IMPORTANT (not wrapped)


@router.patch("/me")
async def update_user(data: dict, user=Depends(verify_token)):
    user_id = user["sub"]

    # ✅ Ensure user exists
    existing = (
        supabase.table("users")
        .select("id")
        .eq("id", user_id)
        .execute()
    )

    if not existing.data:
        supabase.table("users").insert({
            "id": user_id,
            "email": user.get("email"),
        }).execute()

    update_data = {}

    if data.get("username"):
        update_data["username"] = data["username"]

    if "bio" in data:
        update_data["bio"] = data["bio"]

    if data.get("avatar_url"):
        update_data["avatar_url"] = data["avatar_url"]

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields")

    response = (
        supabase.table("users")
        .update(update_data)
        .eq("id", user_id)
        .execute()
    )

    return response.data[0]