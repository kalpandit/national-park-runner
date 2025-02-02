import os
import json
import numpy as np
from flask import Flask
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from src.database.migrate import convert_json
from src.models.itinerary import itinerary


uri = os.getenv("MONGO_URI")

client = MongoClient(uri, tls=True, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")

# Flask app
app = Flask(__name__)
db = client['npr_db']

uc = db['user_collection']
mc = db['model_collection']
ic = db['itinerary_collection']

@app.route("/")
def hello_world():
    if uc.count_documents({}) == 0:
        uc.insert_one(
            {
                "username": "use1",
                "password":"pass1",
                "email":"email1@gmail.com",
                "itineraries":[1,2,3,4]
            }
        )

    if mc.count_documents({}) == 0:
        data = convert_json()

        def replace_nan(obj):
            if isinstance(obj, dict):
                return {k: replace_nan(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [replace_nan(v) for v in obj]
            elif isinstance(obj, float) and np.isnan(obj):  # Convert NaN to None
                return None
            else:
                return obj

        fixed_data = replace_nan(data)

        for park_name, activities in fixed_data.items():
            for activity in activities:
                activity["park"] = park_name
                mc.insert_one(activity)
    
    if ic.count_documents({}) == 0:
        ic.insert_one(
            {
                "itinerary_objects": [],
                "alternative_options":[],
                "objs_used":{},
                "food":False
            }
        )
    def create_itinerary(difficulty, cost):

        itinerary_ = itinerary(difficulty, cost, location=None)
        itinerary_.populate_itinerary()
        return None

    create_itinerary("Hard", 2)
    # query = {"difficulty": "Medium" , "time_of_day": {"$in": ["Morning", "All"]} }  # Filter by difficulty and time of day
    # top_activities = mc.find(query).sort("Rating", -1).limit(3)

    # top_3_morning=list(top_activities)
    # print(top_3_morning)
    print("fuck")

    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True)