import re

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
