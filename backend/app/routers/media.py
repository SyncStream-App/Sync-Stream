from fastapi import APIRouter, UploadFile, File
import cloudinary.uploader

router = APIRouter(prefix="/media", tags=["media"])

@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    result = cloudinary.uploader.upload(file.file)
    return {"url": result["secure_url"]}