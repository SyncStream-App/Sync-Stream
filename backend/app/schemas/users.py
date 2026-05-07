# backend/app/schemas/user.py

from pydantic import BaseModel
from typing import Optional


class UserProfileResponse(BaseModel):
    id: str
    email: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None

    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0

    is_following: bool = False
    is_friend: bool = False

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None