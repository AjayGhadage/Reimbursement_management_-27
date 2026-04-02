import pytesseract
from PIL import Image
import io
import re
import os

# Support both Windows (default) and Linux/Docker paths
tesseract_cmd = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
pytesseract.pytesseract.tesseract_cmd = tesseract_cmd


def extract_text(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("L")  # improve OCR
    text = pytesseract.image_to_string(image)
    return text


def parse_receipt(text):
    amount = None
    date = None

    text = text.replace(",", "").replace("\n", " ")

    # Amount
    amount_match = re.findall(r'₹?\s?(\d+(?:\.\d{1,2})?)', text)
    if amount_match:
        amount = max([float(a) for a in amount_match])

    # Date
    date_match = re.search(r'(\d{2}[/-]\d{2}[/-]\d{2,4})', text)
    if date_match:
        date = date_match.group(1)

    return {
        "amount": amount,
        "date": date,
        "category": "Food"
    }