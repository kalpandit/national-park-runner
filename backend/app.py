import os
import json
import numpy as np
from flask import Flask, request, jsonify
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from src.database.migrate import convert_json
import src.yelp.model as model
from flask_cors import CORS  # Import Flask-CORS

app = Flask(__name__)
CORS(app)

uri = os.getenv("MONGO_URI")

'''client = MongoClient(uri, tls=True, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")

# Flask app

db = client['npr_db']

uc = db['user_collection']
mc = db['model_collection']
ic = db['itinerary_collection']
'''


@app.route("/yelp", methods=['GET'])
def get_food_recommendations():
    breakfast=[]
    lunch=[]
    dinner=[]
    location = request.args.get("location")
    cost = request.args.get("cost")

    breakfast.append(list(model.search_businesses("Breakfast", location,  max_price=cost, limit=5)))
    lunch.append(list(model.search_businesses("Lunch", location,  max_price=cost, limit=5)))
    dinner.append(list(model.search_businesses("Dinner", location,  max_price=cost, limit=5)))

    return jsonify({
    'breakfast': breakfast,
    'lunch': lunch,
    'dinner': dinner
    })




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
    
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True)