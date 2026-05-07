from fastapi import APIRouter, Depends, HTTPException
from app.services.jwt import verify_token
from app.services.supabase import supabase
import uuid

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"]
)


@router.post("")
async def create_room(
    data: dict,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    name = data.get("name", "").strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Room name required"
        )

    room = (
        supabase.table("rooms")
        .insert({
            "owner_id": user_id,
            "name": name,
            "description": data.get("description"),
            "genre": data.get("genre"),
            "cover_image": data.get("cover_image"),
            "is_private": data.get("is_private", False),
            "invite_code": str(uuid.uuid4())
        })
        .execute()
    )

    created_room = room.data[0]

    # auto join owner
    supabase.table("room_members").insert({
        "room_id": created_room["id"],
        "user_id": user_id,
        "role": "admin"
    }).execute()

    return created_room


@router.get("")
async def get_rooms():
    response = (
        supabase.table("rooms")
        .select("""
            *,
            users:owner_id (
                id,
                username,
                avatar_url
            )
        """)
        .eq("is_private", False)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data

@router.get("/{room_id}")
async def get_room(room_id: str):
    response = (
        supabase.table("rooms")
        .select("""
            *,
            users:owner_id (
                id,
                username,
                avatar_url
            )
        """)
        .eq("id", room_id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    return response.data


@router.post("/{room_id}/join")
async def join_room(
    room_id: str,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    existing = (
        supabase.table("room_members")
        .select("id")
        .eq("room_id", room_id)
        .eq("user_id", user_id)
        .execute()
    )

    if existing.data:
        return {
            "message": "Already joined"
        }

    supabase.table("room_members").insert({
        "room_id": room_id,
        "user_id": user_id,
        "role": "member"
    }).execute()

    return {
        "message": "Joined room"
    }

@router.delete("/{room_id}/leave")
async def leave_room(
    room_id: str,
    user=Depends(verify_token)
):
    user_id = user["sub"]

    supabase.table("room_members") \
        .delete() \
        .eq("room_id", room_id) \
        .eq("user_id", user_id) \
        .execute()

    return {
        "message": "Left room"
    }
