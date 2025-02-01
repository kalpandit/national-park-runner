from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import requests

# Load environment variables from .env file
load_dotenv()

# Initialize Gemini API client
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Unsplash API key
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def fetch_unsplash_image(query):
    """Fetch a relevant Unsplash image URL based on the query."""
    print(f"Fetching Unsplash image for: {query}")
    url = "https://api.unsplash.com/photos/random"
    params = {
        "query": query,
        "client_id": UNSPLASH_ACCESS_KEY,
        "orientation": "landscape"
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return {
            "query": query,  # Store the query used
            "image_url": data.get("urls", {}).get("raw", None)  # Get the highest quality image
        }
    return {"query": query, "image_url": "No image available"}

@app.route('/generate_itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    info_request = data.get("info_request", "Yellowstone National Park")

    # Prompt for Gemini
    prompt = f"""
    Generate a JSON itinerary for a visit to {info_request}.
    The JSON should include:
    - The official park name (field should be called name)
    - A general description of the trip (description: )
    - An array of days, each containing an array of activities (array: days)
    - Each activity should include:
      - Type
      - Name
      - time of day (morning, afternoon, evening, night -- call the field time_of_day)
      - Difficulty
      - Time (duration in hours)
      - Accessible (true/false)
      - Education (short learning aspect)
      - Rating (out of 5)
    - Include food recommendations please, even if the user doesn't say it. INCLUDE FOOD for 5 reward points; include lunch and dinner where applicable.

    Activity:
  accessible: boolean;
  difficulty: string;
  education: string;
  name: string;
  time_of_day: string;
  rating: number;
  time: number;
  type: string;

 Day = 
  activities: Activity[];

ItineraryData -->
  days: Day[];
  description: string;
  image: image_url: string ;
  name: string;

    Return only valid JSON without additional text; it should be valid JSON.
    """

    try:
        # Gemini API call
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        # Extract content and parse as JSON
        itinerary_json = response.text.strip('```json\n').strip('```')

        try:
            json_data = json.loads(itinerary_json)
        except json.JSONDecodeError as e:
            return jsonify({"error": "Invalid JSON from AI", "details": str(e)}), 500

        # Ensure park_name exists in AI response
        park_name = json_data.get("name", info_request)  # Use AI output park name if available

        # Fetch trip image (using park_name from AI output)
        json_data["image"] = fetch_unsplash_image(park_name)

        return jsonify(json_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/propose_change', methods=['POST'])
def propose_change():
    data = request.json
    proposed_change = data.get("proposed_change", "Yellowstone National Park")
    current_itinerary = data.get("info_request", "Yellowstone National Park")

    # Prompt for Gemini
    prompt = f"""
    You're a travel agent who speaks in JSON. Your client wants to explore possible alternatives for {proposed_change}.

    The current itinerary is as follows:
    {current_itinerary}

    - Each activity you propose should include:
      - Type
      - Name
      - time of day (morning, afternoon, evening, night -- call the field time_of_day) -- should be the same as the activity whose change is proposed.
      - Difficulty
      - Time (duration in hours) -- ensure this is reasonable and causes no conflicts
      - Accessible (true/false)
      - Education (short learning aspect)
      - Rating (out of 5)
    - Include food recommendations if applicable.

    Activity:
  accessible: boolean;
  difficulty: string;
  education: string;
  name: string;
  time_of_day: string;
  rating: number;
  time: number;
  type: string;

 Day = 
  activities: Activity[];

ItineraryData -->
  days: Day[];
  description: string;
  image: image_url: string ;
  name: string;

    Return only valid JSON without additional text; it should be valid JSON.
    """

    try:
        # Gemini API call
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        # Extract content and parse as JSON
        itinerary_json = response.text.strip('```json\n').strip('```')

        try:
            json_data = json.loads(itinerary_json)
        except json.JSONDecodeError as e:
            return jsonify({"error": "Invalid JSON from AI", "details": str(e)}), 500

        return jsonify(json_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)