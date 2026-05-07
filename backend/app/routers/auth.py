# app/routers/auth.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.supabase import supabase
from app.services.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthRequest(BaseModel):
    access_token: str


@router.post("/callback")
async def auth_callback(data: AuthRequest):
    access_token = data.access_token

    if not access_token:
        raise HTTPException(
            status_code=400,
            detail="No access token provided"
        )

    try:
        # =========================
        # VERIFY SUPABASE USER
        # =========================
        auth_response = supabase.auth.get_user(access_token)

        supabase_user = auth_response.user

        if not supabase_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        metadata = supabase_user.user_metadata or {}

        # =========================
        # UPSERT USER
        # =========================
        result = (
            supabase.table("users")
            .upsert(
                {
                    "id": supabase_user.id,
                    "email": supabase_user.email,
                    "username": metadata.get("username"),
                    "avatar_url": metadata.get("avatar_url"),
                    "banner_url": metadata.get("banner_url"),
                },
                on_conflict="id"
            )
            .execute()
        )

        db_user = result.data[0]

        # =========================
        # APP JWT
        # =========================
        token = create_access_token({
            "sub": db_user["id"],
            "email": db_user["email"],
        })

        return {
            "access_token": token,
            "token_type": "bearer",

            "user": {
                "id": db_user["id"],
                "email": db_user.get("email"),
                "username": db_user.get("username"),
                "bio": db_user.get("bio"),
                "avatar_url": db_user.get("avatar_url"),
                "banner_url": db_user.get("banner_url"),

                "is_onboarded": bool(
                    db_user.get("username")
                ),
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        print("AUTH CALLBACK ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.post("/signout")
async def signout():
    return {
        "message": "Signed out"
    }