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


def serialize_object(obj):
    """ Recursively converts ObjectId and other non-serializable types to JSON-safe formats. """
    if isinstance(obj, dict):
        return {key: serialize_object(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [serialize_object(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)  # Convert ObjectId to a string
    else:
        return obj  # Return as is

@app.route("/create-itinerary", methods=['GET'])
def create_itin():
    try:
        data = request.json

        # Extracting required fields with defaults
        emailaddress = data.get("email")
        if not emailaddress:
            return jsonify({"error": "Missing required field: email"}), 400

        cost = data.get("cost", 4)
        difficulty = data.get("difficulty", "Hard")
        location = data.get("location", "Yosemite National Park")

        # Create itinerary object
        itinerary_obj = itinerary(difficulty, cost, location, emailaddress)
        itinerary_obj.populate_itinerary()

        # ✅ Fix: Ensure result_dict is a dictionary (not a string)
        result_dict = itinerary_obj.convert_to_json()  # Likely a JSON string

        print("Converted JSON back to dict:", result_dict)

        # ✅ Insert into `ic` (itinerary collection)
        insert_result = ic.insert_one(result_dict)
        print("Inserted correctly")

        # ✅ Convert inserted MongoDB document for safe JSON response
        inserted_itinerary = ic.find_one({"_id": insert_result.inserted_id})
        serialized_result = serialize_object(inserted_itinerary)

        return jsonify({"message": "Itinerary created successfully", "itinerary": serialized_result}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    
@app.route("/save-itinerary", methods=['POST'])
def save_itinerary():
    try:
        data = request.json  # Frontend itinerary payload
        email = data.get("email")  # Ensure user association
        
        if not email:
            return jsonify({"error": "Missing email address"}), 400
        
        # Convert frontend itinerary format to backend format
        itinerary_objects = []
        for day in data["days"]:
            for activity in day["activities"]:
                itinerary_objects.append({
                    "name": activity["name"],
                    "difficulty": activity["difficulty"],
                    "type": activity["type"],
                    "time_of_day": activity["time_of_day"],
                    "description": activity.get("description", ""), 
                    "education": activity.get("education", ""), 
                    "rating": activity.get("rating", 0),
                    "time": activity.get("time", 0),
                    "accessible": activity.get("accessible", False)
                })

        # Prepare MongoDB entry
        itinerary_entry = {
            "emailaddress": email,
            "name": data.get("name", "Unnamed Itinerary"),
            "description": data.get("description", ""),  # General itinerary description
            "image_url": data.get("image", {}).get("image_url", ""),
            "itinerary_objects": itinerary_objects,
            "alternative_options": [],  # Placeholder for future alternatives
            "objs_used": {},
            "food": False  # Default food option
        }

        # Save to MongoDB
        insert_result = ic.insert_one(itinerary_entry)

        # Fetch inserted itinerary to return
        inserted_itinerary = ic.find_one({"_id": insert_result.inserted_id})
        serialized_result = serialize_object(inserted_itinerary)

        return jsonify({
            "message": "Itinerary saved successfully",
            "itinerary": serialized_result
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/get-itinerary", methods=['GET'])
def get_itinerary():
    try:
        data = request.json
        email = data.get('email')  # Extract email

        if not email:
            return jsonify({"error": "Missing emailaddress"}), 400

        # ✅ Find all itineraries where emailaddress matches
        itinerary_cursor = ic.find({"emailaddress": email})

        # ✅ Convert cursor to list and ensure ObjectIds are serializable
        itineraries = [serialize_object(itinerary) for itinerary in itinerary_cursor]

        if not itineraries:
            return jsonify({"message": "No itineraries found for this email"}), 404

        return jsonify({"itineraries": itineraries}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=6464)