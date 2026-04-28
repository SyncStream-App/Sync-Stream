from fastapi import APIRouter, UploadFile, File, HTTPException
import cloudinary.uploader

router = APIRouter(prefix="/media", tags=["media"])


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="avatars",
        )

        return {"url": result["secure_url"]}

    except Exception as e:
        print("Cloudinary upload error:", str(e))
        raise HTTPException(status_code=500, detail="Upload failed")