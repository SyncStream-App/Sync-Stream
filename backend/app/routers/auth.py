import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.supabase import supabase
from app.services.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://syncstreampwa.vercel.app")


# ✅ Request schema
class AuthRequest(BaseModel):
    access_token: str


@router.post("/callback")
async def auth_callback(data: AuthRequest):
    """
    Called by frontend after Supabase OAuth.
    Verifies Supabase token, upserts user, returns app JWT.
    """
    access_token = data.access_token

    if not access_token:
        raise HTTPException(status_code=400, detail="No access token provided")

    try:
        # ✅ Verify token with Supabase
        auth_response = supabase.auth.get_user(access_token)
        supabase_user = auth_response.user

        if not supabase_user:
            raise HTTPException(status_code=401, detail="Invalid token")

        # ✅ Prepare user data
        user_data = {
            "id": supabase_user.id,
            "email": supabase_user.email,
            "avatar_url": (supabase_user.user_metadata or {}).get("avatar_url"),
        }

        # ✅ Upsert user (no duplicates)
        upsert_response = (
            supabase.table("users")
            .upsert(user_data, on_conflict="id")
            .execute()
        )

        db_user = upsert_response.data[0] if upsert_response.data else None

        if not db_user:
            raise HTTPException(status_code=500, detail="User creation failed")

        # ✅ Create your app JWT
        token = create_access_token({
            "sub": supabase_user.id,
            "email": supabase_user.email,
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": db_user["id"],
                "email": db_user["email"],
                "username": db_user.get("username"),
                "avatar_url": db_user.get("avatar_url"),
                "bio": db_user.get("bio"),
                "is_onboarded": bool(db_user.get("username")),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Auth callback error:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


# ✅ Signout endpoint (simple + clean)
@router.post("/signout")
async def signout():
    """
    Signout endpoint.
    Frontend should also call supabase.auth.signOut().
    """
    return {"message": "Signed out successfully"}