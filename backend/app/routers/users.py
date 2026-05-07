# app/routers/users.py

from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase import supabase
from app.services.jwt import verify_token

router = APIRouter(prefix="/users", tags=["users"])


# =========================
# CHECK USERNAME
# =========================
@router.get("/check-username")
async def check_username(username: str):
    username = username.strip().lower()

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

    return {
        "available": len(response.data) == 0
    }


# =========================
# GET OWN USER
# =========================
@router.get("/me")
async def get_me(user=Depends(verify_token)):
    user_id = user["sub"]

    response = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    return response.data


# =========================
# GET USER PROFILE
# =========================
# =========================
# GET USER PROFILE
# =========================
@router.get("/{username}")
async def get_user_profile(
    username: str,
    current_user=Depends(verify_token)
):
    username = username.strip().lower()

    response = (
        supabase.table("users")
        .select("*")
        .eq("username", username)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    profile = response.data

    # =========================
    # POSTS COUNT
    # =========================
    posts_response = (
        supabase.table("posts")
        .select("id", count="exact")
        .eq("user_id", profile["id"])
        .execute()
    )

    posts_count = posts_response.count or 0

    # =========================
    # FOLLOWERS COUNT
    # =========================
    followers_response = (
        supabase.table("follows")
        .select("id", count="exact")
        .eq("following_id", profile["id"])
        .execute()
    )

    followers_count = followers_response.count or 0

    # =========================
    # FOLLOWING COUNT
    # =========================
    following_response = (
        supabase.table("follows")
        .select("id", count="exact")
        .eq("follower_id", profile["id"])
        .execute()
    )

    following_count = following_response.count or 0

    # =========================
    # IS FOLLOWING
    # =========================
    follow_check = (
        supabase.table("follows")
        .select("id")
        .eq("follower_id", current_user["sub"])
        .eq("following_id", profile["id"])
        .execute()
    )

    is_following = len(follow_check.data) > 0

    # =========================
    # POSTS
    # =========================
    posts_response = (
        supabase.table("posts")
        .select("""
            *,
            users:user_id (
                id,
                username,
                avatar_url
            )
        """)
        .eq("user_id", profile["id"])
        .order("created_at", desc=True)
        .execute()
    )

    posts = []

    for post in posts_response.data or []:
        posts.append({
            **post,
            "user": post.get("users")
        })

    return {
        "user": {
            "id": profile["id"],
            "username": profile.get("username"),
            "display_name": profile.get("display_name"),
            "email": profile.get("email"),
            "bio": profile.get("bio"),
            "avatar_url": profile.get("avatar_url"),
            "banner_url": profile.get("banner_url"),
            "created_at": profile.get("created_at"),

            "followers_count": followers_count,
            "following_count": following_count,
            "posts_count": posts_count,

            "is_following": is_following,
        },

        "posts": posts
    }
# =========================
# UPDATE PROFILE
# =========================
@router.patch("/me")
async def update_user(
    data: dict,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    existing = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if not existing.data:
        supabase.table("users").insert({
            "id": user_id,
            "email": user.get("email"),
        }).execute()

    update_data = {}

    # =========================
    # USERNAME
    # =========================
    if "username" in data and data["username"]:
        username = data["username"].strip().lower()

        if len(username) < 3 or len(username) > 20:
            raise HTTPException(
                status_code=400,
                detail="Username must be 3-20 characters"
            )

        if not username.replace("_", "").isalnum():
            raise HTTPException(
                status_code=400,
                detail="Invalid username"
            )

        existing_username = (
            supabase.table("users")
            .select("id")
            .eq("username", username)
            .neq("id", user_id)
            .execute()
        )

        if existing_username.data:
            raise HTTPException(
                status_code=400,
                detail="Username already taken"
            )

        update_data["username"] = username

    # =========================
    # BIO
    # =========================
    if "bio" in data:
        update_data["bio"] = data["bio"]

    # =========================
    # AVATAR
    # =========================
    if "avatar_url" in data:
        update_data["avatar_url"] = data["avatar_url"]

    # =========================
    # BANNER
    # =========================
    if "banner_url" in data:
        update_data["banner_url"] = data["banner_url"]

    # =========================
    # DISPLAY NAME
    # =========================
    if "display_name" in data:
        update_data["display_name"] = data["display_name"]

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No valid fields"
        )

    response = (
        supabase.table("users")
        .update(update_data)
        .eq("id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Update failed"
        )
    
    updated_user = response.data[0]

    return {
        "user": {
            **updated_user,
            "is_onboarded": bool(updated_user.get("username"))
        }
    }


# =========================
# FOLLOW USER
# =========================
@router.post("/{user_id}/follow")
async def follow_user(
    user_id: str,
    user=Depends(verify_token)
):
    follower_id = user["sub"]

    if follower_id == user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot follow yourself"
        )

    existing = (
        supabase.table("follows")
        .select("id")
        .eq("follower_id", follower_id)
        .eq("following_id", user_id)
        .execute()
    )

    if existing.data:
        return {"message": "Already following"}

    supabase.table("follows").insert({
        "follower_id": follower_id,
        "following_id": user_id,
    }).execute()

    return {"message": "Followed"}


# =========================
# UNFOLLOW USER
# =========================
@router.delete("/{user_id}/follow")
async def unfollow_user(
    user_id: str,
    user=Depends(verify_token)
):
    follower_id = user["sub"]

    supabase.table("follows") \
        .delete() \
        .eq("follower_id", follower_id) \
        .eq("following_id", user_id) \
        .execute()

    return {"message": "Unfollowed"}


# =========================
# GET FOLLOWERS
# =========================
@router.get("/{user_id}/followers")
async def get_followers(user_id: str):
    response = (
        supabase.table("follows")
        .select("""
            follower_id,
            users!follows_follower_id_fkey(
                id,
                username,
                avatar_url
            )
        """)
        .eq("following_id", user_id)
        .execute()
    )

    return response.data


# =========================
# GET FOLLOWING
# =========================
# =========================
# GET FOLLOWING
# =========================
@router.get("/{user_id}/following")
async def get_following(user_id: str):

    response = (
        supabase.table("follows")
        .select("""
            users!follows_following_id_fkey(
                id,
                username,
                avatar_url,
                bio
            )
        """)
        .eq("follower_id", user_id)
        .execute()
    )

    following = []

    for item in response.data:
        if item.get("users"):
            following.append(item["users"])

    return following

@router.get("/suggested")
async def suggested_users(
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
        supabase.table("users")
        .select("""
            id,
            username,
            avatar_url,
            bio
        """)
        .not_.in_("id", following_ids)
        .limit(5)
        .execute()
    )

    return response.data