from fastapi import APIRouter, Depends
from app.services.supabase import supabase
from app.services.jwt import verify_token

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/")
async def create_post(data: dict, user=Depends(verify_token)):
    post = supabase.table("posts").insert({
        "user_id": user["sub"],
        "content": data.get("content"),
        "image_url": data.get("image_url")
    }).execute()

    return post.data[0]


@router.get("/feed")
async def get_feed(user=Depends(verify_token)):
    follows = supabase.table("follows") \
        .select("following_id") \
        .eq("follower_id", user["sub"]) \
        .execute()

    ids = [f["following_id"] for f in follows.data]

    posts = supabase.table("posts") \
        .select("*") \
        .in_("user_id", ids) \
        .order("created_at", desc=True) \
        .execute()

    return posts.data


@router.delete("/{post_id}")
async def delete_post(post_id: str, user=Depends(verify_token)):
    supabase.table("posts") \
        .delete() \
        .eq("id", post_id) \
        .eq("user_id", user["sub"]) \
        .execute()

    return {"message": "deleted"}