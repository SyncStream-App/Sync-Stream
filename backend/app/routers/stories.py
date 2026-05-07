from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase import supabase
from app.services.jwt import verify_token

router = APIRouter(prefix="/stories", tags=["stories"])


# =========================
# CREATE STORY
# =========================
@router.post("")
async def create_story(
    data: dict,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    text_content = data.get("text_content")
    image_url = data.get("image_url")
    background_color = data.get(
        "background_color",
        "#7c3aed"
    )

    if not text_content and not image_url:
        raise HTTPException(
            status_code=400,
            detail="Story cannot be empty"
        )

    response = (
        supabase.table("stories")
        .insert({
            "user_id": user_id,
            "text_content": text_content,
            "image_url": image_url,
            "background_color": background_color,
        })
        .execute()
    )

    story = response.data[0]

    user_data = (
        supabase.table("users")
        .select("id, username, avatar_url")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return {
        **story,
        "user": user_data.data,
        "views_count": 0,
        "seen": False,
    }


# =========================
# GET STORIES FEED
# =========================
@router.get("/feed")
async def get_stories_feed(
    user=Depends(verify_token)
):
    user_id = user["sub"]

    follows = (
        supabase.table("follows")
        .select("following_id")
        .eq("follower_id", user_id)
        .execute()
    )

    following_ids = [
        item["following_id"]
        for item in follows.data
    ]

    following_ids.append(user_id)

    response = (
        supabase.table("stories")
        .select("""
            *,
            users:user_id (
                id,
                username,
                avatar_url
            )
        """)
        .in_("user_id", following_ids)
        .gt("expires_at", "now()")
        .order("created_at", desc=True)
        .execute()
    )

    stories = []

    for story in response.data:

        seen = (
            supabase.table("story_views")
            .select("id")
            .eq("story_id", story["id"])
            .eq("viewer_id", user_id)
            .execute()
        )

        views = (
            supabase.table("story_views")
            .select("id", count="exact")
            .eq("story_id", story["id"])
            .execute()
        )

        stories.append({
            **story,
            "user": story["users"],
            "seen": len(seen.data) > 0,
            "views_count": views.count or 0,
        })

    return stories


# =========================
# VIEW STORY
# =========================
@router.post("/{story_id}/view")
async def view_story(
    story_id: str,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    existing = (
        supabase.table("story_views")
        .select("id")
        .eq("story_id", story_id)
        .eq("viewer_id", user_id)
        .execute()
    )

    if not existing.data:
        supabase.table("story_views").insert({
            "story_id": story_id,
            "viewer_id": user_id,
        }).execute()

    return {
        "message": "Viewed"
    }