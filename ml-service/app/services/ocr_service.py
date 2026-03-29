import pytesseract
from PIL import Image
import io
import re

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    text = pytesseract.image_to_string(image)
    return text


def parse_receipt(text):
    amount = None
    date = None

    # Simple regex (can improve later)
    amount_match = re.search(r'(\d+\.\d{2})', text)
    date_match = re.search(r'(\d{2}/\d{2}/\d{4})', text)

    if amount_match:
        amount = float(amount_match.group(1))

    if date_match:
        date = date_match.group(1)

    return {
        "amount": amount,
        "date": date,
        "category": "Food"  # basic assumption
    }