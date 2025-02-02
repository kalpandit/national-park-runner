import os
import json
import numpy as np
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from src.database.migrate import convert_json
from src.models.itinerary import itinerary
from flask import request, jsonify, Flask
import src.yelp.model as yelp_model
from bson.objectid import ObjectId

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
    # def create_itinerary(difficulty, cost):

    #     itinerary_ = itinerary(difficulty, cost, location=None)
    #     itinerary_.populate_itinerary()
    #     return None

    # create_itinerary("Hard", 2)
    # query = {"difficulty": "Medium" , "time_of_day": {"$in": ["Morning", "All"]} }  # Filter by difficulty and time of day
    # top_activities = mc.find(query).sort("Rating", -1).limit(3)

    # top_3_morning=list(top_activities)
    # print(top_3_morning)
    print("fuck")

    return "<p>Hello, World!</p>"

@app.route("/create-itinerary", methods=['GET'])
def create_itin():

    data = request.json
    emailaddress = data.get("email")
    cost = data.get("cost", 4)
    difficulty = data.get("difficulty", "Hard")
    location = data.get("location", "Yosemite National Park")

    itinerary_obj = itinerary(difficulty, cost, location, emailaddress)

    itinerary_obj.populate_itinerary()

    result = itinerary_obj.convert_to_json() # TODO: Finish

    # TODO: Insert Itinerary into ic table, Add itinerary ID to users table
    ic.insert_one(result)

@app.route("/update-preferences", methods=['POST'])
def update_preferences():
    try:
        data = request.json
        emailaddress = data['email']
        cost = data['cost']
        accessibility = data['accessibility']  # Fixed typo (accessability -> accessibility)
        difficulty = data['difficulty']

        # Update document
        result = uc.update_one(
            {"email": emailaddress},  # Query condition
            {"$set": {
                "cost": cost,
                "accessibility": accessibility,
                "difficulty": difficulty
            }}
        )

        # Check if document was found and updated
        if result.matched_count == 0:
            return jsonify({"message": "No document found with this email address"}), 404
        elif result.modified_count == 0:
            return jsonify({"message": "No changes made"}), 200

        return jsonify({"message": "Preferences updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/users", methods=['POST'])
def add_user():
    try: 
        data = request.json
        emailaddress = data.get("email")

        if not emailaddress:
            return jsonify({"error": "Missing email field"}), 400

        # Insert the new user
        result = uc.insert_one({"email": emailaddress})

        if result.inserted_id:
            return jsonify({"message": "User added successfully", "user_id": str(result.inserted_id)}), 201
        else:
            return jsonify({"error": "User insertion failed"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/yelp", methods=['GET'])
def get_yelp():

    data = request.json
    term = data.get('term', "Breakfast")
    location = data.get('location', "Yosemite Valley")
    max_cost = data.get('price', 4)
    result = yelp_model.search_businesses(term, location, max_cost)
    return result

@app.route("/update-itinerary", methods=['POST'])
def update_itinerary():
    try:
        data = request.json
        
        # Extract itinerary_id and updated fields
        itinerary_id = data.get('itinerary_id')  # Ensure the key exists
        update_fields = data

        if not itinerary_id or not update_fields:
            return jsonify({"error": "Missing itinerary_id or updates"}), 400

        # Convert string ID to ObjectId
        try:
            itinerary_object_id = ObjectId(itinerary_id)
        except Exception:
            return jsonify({"error": "Invalid itinerary_id format"}), 400

        # Update the itinerary
        result = ic.update_one(
            {"_id": itinerary_object_id},  # Find by itinerary_id
            {"$set": update_fields}  # Update only provided fields
        )

        # Response based on update results
        if result.matched_count == 0:
            return jsonify({"message": "No itinerary found with this ID"}), 404
        elif result.modified_count == 0:
            return jsonify({"message": "No changes made"}), 200

        return jsonify({"message": "Itinerary updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/get-itinerary", methods=['GET'])
def get_itinerary():
    try:
        data = request.json
        email = data.get('emailaddress')  # Extract email

        if not email:
            return jsonify({"error": "Missing emailaddress"}), 400

        # Step 1: Query `uc` collection to get itinerary IDs
        itinerary_cursor = uc.find({"emailaddress": email}, {"itinerary_id": 1, "_id": 0})
        itinerary_ids = [entry["itinerary_id"] for entry in itinerary_cursor]

        if not itinerary_ids:
            return jsonify({"message": "No itineraries found for this email"}), 404

        # Step 2: Query `ic` collection using itinerary_ids (which are already strings)
        itinerary_details_cursor = ic.find({"_id": {"$in": itinerary_ids}})

        # Convert MongoDB cursor to list of dictionaries
        itineraries = []
        for itinerary in itinerary_details_cursor:
            itinerary["_id"] = str(itinerary["_id"])  # Convert `_id` to string for consistency
            itineraries.append(itinerary)

        if not itineraries:
            return jsonify({"message": "Itinerary IDs found, but no itinerary details available"}), 404

        return jsonify({"itineraries": itineraries}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)