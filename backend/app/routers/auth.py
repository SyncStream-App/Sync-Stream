import os
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from app.services.supabase import supabase
from app.services.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://syncstreampwa.vercel.app/")
    
@router.post("/callback")
async def auth_callback(request: Request): 
    """
    Called by frontend after Supabase handles the OAuth callback.
    Receives the Supabase session, upserts user in our users table,
    returns our own JWT.
    """
    body = await request.json()
    access_token = body.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="No access token provided")
    
    try: 
        # Verify the token with Supabase and get the user
        auth_response = supabase.auth.get_user(access_token)
        supabase_user = auth_response.user

        if not supabase_user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Upsert user in our public.users table
        # on_conflict prevents duplicates - safe call to every login
        user_data = {
            "id": supabase_user.id,
            "email": supabase_user.email,
            "avatar_url": supabase_user.user_metadata.get("avatar_url"),
        }

        upsert_response = (
            supabase.table("users")
            .upsert(user_data, on_conflict="id", ignore_duplicates=False)
            .execute()
        )

        db_user = upsert_response.data[0] if upsert_response.data else None

        if not db_user:
            raise HTTPException(status_code=500, detail="Failed to create user record")
        
        #Issue our own JWT for the frontend
        token = create_access_token(data={
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
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/signout")
async def signout(request: Request):
    """Sign out - frontend should also call supabase.auth.signOut()."""
    return {"message": "Signed out successfully"}