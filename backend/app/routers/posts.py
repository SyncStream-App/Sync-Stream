from fastapi import APIRouter, HTTPException, Depends, Query
from app.services.supabase import supabase
from app.services.jwt import verify_token

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)


# ======================================================
# HELPER
# ======================================================

def format_post(post, current_user_id=None):

    likes_count = post.get("post_likes_count", 0)
    comments_count = post.get("comments_count", 0)

    is_liked = False

    if current_user_id and post.get("liked_users"):
        is_liked = any(
            like["user_id"] == current_user_id
            for like in post["liked_users"]
        )

    return {
        "id": post["id"],
        "content": post.get("content"),
        "image_url": post.get("image_url"),
        "created_at": post.get("created_at"),

        "user_id": post.get("user_id"),

        "user": {
            "id": post["users"]["id"],
            "username": post["users"]["username"],
            "avatar_url": post["users"]["avatar_url"],
        } if post.get("users") else None,

        "likes_count": likes_count,
        "comments_count": comments_count,
        "is_liked": is_liked,
    }


# ======================================================
# CREATE POST
# ======================================================

@router.post("")
async def create_post(
    data: dict,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    content = data.get("content", "").strip()
    image_url = data.get("image_url")

    if not content and not image_url:
        raise HTTPException(
            status_code=400,
            detail="Post cannot be empty"
        )

    response = (
        supabase.table("posts")
        .insert({
            "user_id": user_id,
            "content": content,
            "image_url": image_url,
        })
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create post"
        )

    post = response.data[0]

    user_response = (
        supabase.table("users")
        .select("id, username, avatar_url")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return {
        "id": post["id"],
        "content": post["content"],
        "image_url": post["image_url"],
        "created_at": post["created_at"],

        "user_id": user_id,

        "user": user_response.data,

        "likes_count": 0,
        "comments_count": 0,
        "is_liked": False,
    }


# ======================================================
# GET FEED
# ======================================================

@router.get("/feed")
async def get_feed(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, le=50),
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

    start = (page - 1) * limit
    end = start + limit - 1

    response = (
        supabase.table("posts")
        .select("""
            *,
            users:user_id (
                id,
                username,
                avatar_url
            ),
            liked_users:post_likes (
                user_id
            )
        """)
        .in_("user_id", following_ids)
        .order("created_at", desc=True)
        .range(start, end)
        .execute()
    )

    posts = []

    for post in response.data:

        likes_count = (
            supabase.table("post_likes")
            .select("id", count="exact")
            .eq("post_id", post["id"])
            .execute()
        ).count or 0

        comments_count = (
            supabase.table("comments")
            .select("id", count="exact")
            .eq("post_id", post["id"])
            .execute()
        ).count or 0

        post["post_likes_count"] = likes_count
        post["comments_count"] = comments_count

        posts.append(
            format_post(post, user_id)
        )

    return posts


# ======================================================
# GET SINGLE POST
# ======================================================

@router.get("/{post_id}")
async def get_post(
    post_id: str,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    response = (
        supabase.table("posts")
        .select("""
            *,
            users:user_id (
                id,
                username,
                avatar_url
            ),
            liked_users:post_likes (
                user_id
            )
        """)
        .eq("id", post_id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    post = response.data

    likes_count = (
        supabase.table("post_likes")
        .select("id", count="exact")
        .eq("post_id", post_id)
        .execute()
    ).count or 0

    comments_count = (
        supabase.table("comments")
        .select("id", count="exact")
        .eq("post_id", post_id)
        .execute()
    ).count or 0

    post["post_likes_count"] = likes_count
    post["comments_count"] = comments_count

    return format_post(post, user_id)


# ======================================================
# EDIT POST
# ======================================================

@router.patch("/{post_id}")
async def update_post(
    post_id: str,
    data: dict,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    post_response = (
        supabase.table("posts")
        .select("*")
        .eq("id", post_id)
        .single()
        .execute()
    )

    post = post_response.data

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    if post["user_id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized"
        )

    update_data = {}

    if "content" in data:
        update_data["content"] = data["content"]

    if "image_url" in data:
        update_data["image_url"] = data["image_url"]

    response = (
        supabase.table("posts")
        .update(update_data)
        .eq("id", post_id)
        .execute()
    )

    return response.data[0]


# ======================================================
# DELETE POST
# ======================================================

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    response = (
        supabase.table("posts")
        .select("*")
        .eq("id", post_id)
        .single()
        .execute()
    )

    post = response.data

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    if post["user_id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized"
        )

    supabase.table("posts") \
        .delete() \
        .eq("id", post_id) \
        .execute()

    return {
        "message": "Post deleted"
    }


# ======================================================
# LIKE POST
# ======================================================

@router.post("/{post_id}/like")
async def like_post(
    post_id: str,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    existing = (
        supabase.table("post_likes")
        .select("id")
        .eq("post_id", post_id)
        .eq("user_id", user_id)
        .execute()
    )

    if existing.data:
        return {
            "message": "Already liked"
        }

    supabase.table("post_likes").insert({
        "post_id": post_id,
        "user_id": user_id,
    }).execute()

    return {
        "message": "Liked"
    }


# ======================================================
# UNLIKE POST
# ======================================================

@router.delete("/{post_id}/like")
async def unlike_post(
    post_id: str,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    supabase.table("post_likes") \
        .delete() \
        .eq("post_id", post_id) \
        .eq("user_id", user_id) \
        .execute()

    return {
        "message": "Unliked"
    }


# ======================================================
# CREATE COMMENT
# ======================================================

@router.post("/{post_id}/comments")
async def create_comment(
    post_id: str,
    data: dict,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    content = data.get("content", "").strip()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Comment required"
        )

    response = (
        supabase.table("comments")
        .insert({
            "post_id": post_id,
            "user_id": user_id,
            "content": content,
        })
        .execute()
    )

    comment = response.data[0]

    user_response = (
        supabase.table("users")
        .select("id, username, avatar_url")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return {
        **comment,
        "user": user_response.data
    }


# ======================================================
# GET COMMENTS
# ======================================================

@router.get("/{post_id}/comments")
async def get_comments(post_id: str):

    response = (
        supabase.table("comments")
        .select("""
            *,
            users:user_id (
                id,
                username,
                avatar_url
            )
        """)
        .eq("post_id", post_id)
        .order("created_at", desc=False)
        .execute()
    )

    comments = []

    for comment in response.data:
        comments.append({
            "id": comment["id"],
            "content": comment["content"],
            "created_at": comment["created_at"],
            "post_id": comment["post_id"],
            "user_id": comment["user_id"],

            "user": {
                "id": comment["users"]["id"],
                "username": comment["users"]["username"],
                "avatar_url": comment["users"]["avatar_url"],
            }
        })

    return comments


# ======================================================
# DELETE COMMENT
# ======================================================

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    response = (
        supabase.table("comments")
        .select("*")
        .eq("id", comment_id)
        .single()
        .execute()
    )

    comment = response.data

    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )

    if comment["user_id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized"
        )

    supabase.table("comments") \
        .delete() \
        .eq("id", comment_id) \
        .execute()

    return {
        "message": "Comment deleted"
    }