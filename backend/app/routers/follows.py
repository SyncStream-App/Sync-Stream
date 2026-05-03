from fastapi import APIRouter, Depends
from app.services.supabase import supabase
from app.services.jwt import verify_token

router = APIRouter(prefix="/follows", tags=["follows"])


@router.post("/{user_id}")
async def follow_user(user_id: str, user=Depends(verify_token)):
    supabase.table("follows").insert({
        "follower_id": user["sub"],
        "following_id": user_id
    }).execute()

    return {"message": "followed"}


@router.delete("/{user_id}")
async def unfollow_user(user_id: str, user=Depends(verify_token)):
    supabase.table("follows") \
        .delete() \
        .eq("follower_id", user["sub"]) \
        .eq("following_id", user_id) \
        .execute()

    return {"message": "unfollowed"}


@router.get("/{user_id}/followers")
async def get_followers(user_id: str):
    res = supabase.table("follows") \
        .select("*") \
        .eq("following_id", user_id) \
        .execute()

    return res.data


@router.get("/{user_id}/following")
async def get_following(user_id: str):
    res = supabase.table("follows") \
        .select("*") \
        .eq("follower_id", user_id) \
        .execute()

    return res.data