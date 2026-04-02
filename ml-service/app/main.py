from fastapi import FastAPI
from app.routes.ocr_routes import router as ocr_router

app = FastAPI()

app.include_router(ocr_router, prefix="/ocr")