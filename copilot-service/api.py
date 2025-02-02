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
      - Time (duration in hours) -- ensure this is included
      - Accessible (true/false)
      - Education (short learning aspect)
      - Rating (out of 5)
    - Include food recommendations please, even if the user doesn't say it. INCLUDE FOOD for 5 reward points; include lunch and dinner where applicable.

    Activity:
  accessible: boolean - must be lowercase;
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
            return jsonify({"error": "Invalid JSON from AI", "details": itinerary_json}), 500

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

    The current itinerary is as follows -- don't suggest any activities already listed here:
    {current_itinerary}

    - Each activity you propose should be distinct and include:
    The current itinerary is as follows:
    {current_itinerary}

    - Each activity you propose should include:
      - Type
      - Name
      - time of day (morning, afternoon, evening, night -- call the field time_of_day) -- should be the same as the activity whose change is proposed.
      - Difficulty
      - Time (duration in hours) -- ensure this is reasonable and causes no conflicts
      - accessible: boolean - must be lowercase;
      - Education (short learning aspect) -- must be included
      - Rating (out of 5)
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

    ensure the JSON is valid, and you get 10 points. Ensure that all necessary fields are included (food counts as an activity), for 50 points. PLEASE make sure that the activity in question is the same type or similar as the one where an alternative is proposed, for 100 points. Try to get the most points.
    """

    try:
        # Gemini API call
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        # Extract content and parse as JSON
        itinerary_json = response.text.strip('```json\n').strip('```')
        print(itinerary_json)

        try:
            json_data = json.loads(itinerary_json)
        except json.JSONDecodeError as e:
            return jsonify({"error": "Invalid JSON from AI", "details": str(e)}), 500

        return jsonify(json_data)

    except Exception as e:
        print(itinerary_json)
        return jsonify({"error": str(e)}), 500
    
@app.route('/expert_chatbot', methods=['POST'])
def expert_chatbot():
    data = request.json
    prompt = data.get("message", "Ask me a question")
    prev_messages = data.get("previous_messages", "NO previous messages")

    # Prompt for Gemini
    prompt = f"""
    You're a travel agent who is friendly and responds to questions. 

    You're knowledgeable about national parks in general (you MUST be able to talk about OTHER national parks). Here's some expert advice that is not all inclusive, but ONLY for Yosemite and Yellowstone:

    You are responsible for finding out info about other parks.

    Yellowstone National Park (Established in 1872 – The First National Park!)
Supervolcano Alert! Yellowstone sits on top of a massive underground volcano, and its last major eruption was over 640,000 years ago.
Old Faithful Geyser: This famous geyser erupts every 60 to 90 minutes, shooting hot water up to 180 feet in the air!
Hot Springs & Mud Pots: The colorful pools, like the Grand Prismatic Spring, get their colors from heat-loving bacteria.
Wildlife Galore: You’ll find grizzly bears, bison, wolves, and elk roaming freely. Yellowstone has the largest concentration of mammals in the lower 48 states!
Earthquake Central! The park experiences 1,000 to 3,000 small earthquakes per year due to volcanic activity.
The Largest High-Elevation Lake in North America is Yellowstone Lake, sitting at 7,733 feet above sea level.
More Geysers Than Anywhere Else on Earth  – Over 500 geysers exist in the park, which is more than half of the world’s total geysers!
Bison Are Survivors  – The Yellowstone bison herd is the oldest and largest in the U.S., and they’ve been here since prehistoric times!
The Petrified Forests  – Ancient forests in the park were buried by volcanic ash 50 million years ago, turning the trees into stone.
Yellowstone’s Dark Skies  – Some of the best stargazing spots include Lamar Valley and Mount Washburn.
International Space Station (ISS) – If you check the timing in advance, you might spot the ISS zooming across the sky!
Look for the Andromeda Galaxy  – If you’re in a dark enough area, you can see our neighboring galaxy with just your eyes!
Yosemite National Park (Established in 1890)
Home of Giant Trees! The Mariposa Grove has sequoia trees over 3,000 years old, some taller than 20-story buildings!
El Capitan: This massive granite cliff is one of the most famous rock-climbing spots in the world.
Waterfall Wonderland: Yosemite Falls is one of North America's tallest waterfalls, dropping 2,425 feet (that’s taller than the Empire State Building).
Glacier-Carved Valley: The stunning Yosemite Valley was shaped by glaciers over millions of years, leaving behind towering cliffs and deep valleys.
Half Dome’s Famous Hike – One of the park’s most famous challenges, this 14-mile round-trip hike includes a steep climb up a cable route!
John Muir’s Influence  – Yosemite inspired John Muir, the father of national parks, to push for conservation in the late 1800s.
The Firefall Illusion  – Every February, Horsetail Fall glows bright orange at sunset, making it look like lava is flowing down the cliffs!
One of the First National Parks – Yosemite was officially protected in 1864 (before the National Park Service even existed!).
Sequoia Giants – The Grizzly Giant, one of Yosemite’s oldest sequoias, is over 2,700 years old!
Yosemite's High Altitude = Less Light Pollution! You can see thousands of stars, the Milky Way, and even distant planets.
International Space Station (ISS) – If you check the timing in advance, you might spot the ISS zooming across the sky!
Look for the Andromeda Galaxy  – If you’re in a dark enough area, you can see our neighboring galaxy with just your eyes!
The Sky / Stars in Both Parks
The Milky Way: A bright river of stars stretching across the sky, best seen in summer.
Constellations:
Orion (Winter) – Look for the famous Orion’s Belt (three stars in a row).
Big Dipper & Little Dipper – The North Star (Polaris) is at the end of the Little Dipper’s handle.
Scorpius (Summer) – A bright, curving scorpion shape with the red star Antares at its heart.
Meteor Showers:  The Perseids (August) and Geminids (December) light up the night sky with dozens of shooting stars per hour that can be clearly seen in Yosemite and Yellowstone
Yosemite's High Altitude = Less Light Pollution! You can see thousands of stars, the Milky Way, and even distant planets.
Yellowstone’s Dark Skies – Some of the best stargazing spots include Lamar Valley and Mount Washburn.
International Space Station (ISS) – If you check the timing in advance, you might spot the ISS zooming across the sky!
Look for the Andromeda Galaxy  – If you’re in a dark enough area, you can see our neighboring galaxy with just your eyes!


Fun Travel Tips!
Bring binoculars! You’ll get amazing views of wildlife and the night sky.
Layers are key! Even in summer, nights can be cold in the mountains.
Respect wildlife! Stay 100 yards from bears and wolves, and 25 yards from bison (they can run faster than you!).
What to Bring:
✅ Water & Snacks – Always carry extra water, especially at high elevations or in hot weather. Energy bars, nuts, and dried fruit are great for hikes.
✅ Layers of Clothing – Weather can change quickly, so bring a lightweight jacket even in summer.
✅ Map & Compass/GPS – Cell service is often unreliable in remote areas. A paper map is a lifesaver!
✅ First Aid Kit – Bandages, antiseptic wipes, tweezers (for splinters or ticks), and pain relievers.
✅ Good Hiking Shoes – Trails can be rocky, muddy, or steep, so sturdy shoes are a must.
✅ Bear Spray (If Needed) – In places like Yellowstone, this can help deter a bear encounter.
✅ Sunscreen & Sunglasses – Higher elevations mean stronger UV rays. Protect your skin!
✅ Bug Spray – Mosquitoes and ticks can be a nuisance in wooded areas.
✅ Flashlight or Headlamp – Sunsets quickly in the mountains, and trails can get dark fast.
✅ Trash Bag – Pack out everything you bring in to keep the parks clean.
Important Safety Tips
Never Feed Wildlife – It’s dangerous for both you and the animals. A fed animal often becomes aggressive and may have to be relocated or euthanized.
Stay on Marked Trails – Straying off-trail can lead to getting lost or damaging delicate ecosystems.
Bear Safety – In bear country, make noise while hiking, store food properly, and carry bear spray.
Respect the Terrain – Climbing cliffs like El Capitan (Yosemite) or getting too close to geysers (Yellowstone) is extremely dangerous.
Camp Smart – Set up tents away from water sources and food storage to avoid attracting wildlife.
🌩️ Watch the Weather – Flash floods, lightning, or sudden temperature drops can be life-threatening.

The user's question is: {prompt}
Previous messages: {prev_messages}

Generate a response. Write it in Markdown, including with newlines where necessary.

    """

    try:
        # Gemini API call
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        # Extract content and parse as JSON
        itinerary_json = {}
        itinerary_json['reply'] = response.text
        print(itinerary_json)


        try:
            json_data = itinerary_json
        except json.JSONDecodeError as e:
            return jsonify({"error": "Invalid JSON from AI", "details": str(e)}), 500

        return jsonify(json_data)

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)