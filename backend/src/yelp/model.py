import requests
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

API_KEY = os.getenv("API_KEY")

BASE_URL = "https://api.yelp.com/v3/businesses/search"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}"
}

def search_businesses(term, location, max_price=4, limit=5):

    max_price = min(max(1, max_price), 4)
    
    price_levels = ",".join(map(str, range(1, max_price + 1)))
    print(price_levels)
    
    params = {
        "term": term,
        "location": location,
        "price": price_levels,
        "limit": limit
    }

    response = requests.get(BASE_URL, headers=HEADERS, params=params)

    if response.status_code == 200:
        return parse_json(response.json())
    else:
        return {"error": f"Request failed with status code {response.status_code}"}
    
def parse_json(response):

    businesses = response.get("businesses", [])  # Extract businesses list
    parsed_data = []

    for biz in businesses:
        parsed_data.append({
            "name": biz.get("name", "N/A"),
            "rating": biz.get("rating", "N/A"),
            "cost": biz.get("price", "N/A"),
            "food_type": ", ".join([cat["title"] for cat in biz.get("categories", [])]),  # Extract category names
            "city": biz.get("location", {}).get("city", "N/A")
        })

    return parsed_data