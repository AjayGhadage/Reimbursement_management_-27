import pytesseract
from PIL import Image
import io
import re

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

def parse_receipt(text):
    # Search for amounts (e.g., $10.00, 500.00 INR, INR 500)
    # This is a basic regex, could be improved
    amount_match = re.search(r"(\$|INR|Rs|EUR|GBP)?\s*(\d+[\.,]\d{2})", text, re.IGNORECASE)
    
    amount = 0
    currency = "USD"
    
    if amount_match:
        cur_sym = amount_match.group(1)
        if cur_sym:
            if cur_sym.upper() in ["INR", "RS"]: currency = "INR"
            elif cur_sym == "$": currency = "USD"
            elif cur_sym.upper() == "EUR": currency = "EUR"
            elif cur_sym.upper() == "GBP": currency = "GBP"
        
        amount = float(amount_match.group(2).replace(",", "."))

    # Search for dates
    date_match = re.search(r"(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2})", text)
    date_str = date_match.group(1) if date_match else ""

    return {
        "amount": amount,
        "currency": currency,
        "date": date_str,
        "description": "Scanned Expense"
    }