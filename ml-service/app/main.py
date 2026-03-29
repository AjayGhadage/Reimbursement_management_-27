from fastapi import FastAPI
from app.routes import ocr_routes

app = FastAPI(title="ML OCR Service")

app.include_router(ocr_routes.router, prefix="/api/ocr", tags=["OCR"])

@app.get("/")
def read_root():
    return {"message": "ML OCR Service is running 🚀"}
