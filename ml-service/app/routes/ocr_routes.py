from fastapi import APIRouter, UploadFile, File
from app.services.ocr_service import extract_text, parse_receipt

router = APIRouter()

@router.post("")
async def process_ocr(file: UploadFile = File(...)):
    contents = await file.read()

    text = extract_text(contents)
    data = parse_receipt(text)

    return {
        "raw_text": text,
        "parsed": data
    }