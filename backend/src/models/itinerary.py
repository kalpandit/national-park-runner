import os
from pymongo import MongoClient
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import json
from bson import ObjectId 

uri = os.getenv("MONGO_URI")
client = MongoClient(uri, tls=True, server_api=ServerApi('1'))

db = client['npr_db']
mc = db['model_collection']


class itinerary:
    def __init__(self, difficulty, cost, location, emailaddress):
        # A list of itinerary objects
        self.itinerary_objects_morning = []
        self.alternative_options_morning = []

        self.itinerary_objects_noon = []
        self.alternative_options_noon = []

        self.itinerary_objects_night = []
        self.alternative_options_night = []

        self.difficulty = difficulty
        self.cost = cost
        self.location = location
        self.emailaddress = emailaddress

    def serialize_object(self, obj):
        """ Recursively converts ObjectId and Cursor objects into JSON serializable formats. """
        if isinstance(obj, dict):
            return {key: self.serialize_object(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self.serialize_object(item) for item in obj]
        elif isinstance(obj, ObjectId):
            return str(obj)  # Convert ObjectId to string
        else:
            return obj

    def convert_to_json(self):
        itinerary_dict = {
            "itinerary_objects_morning": self.serialize_object(self.itinerary_objects_morning),
            "alternative_options_morning": self.serialize_object(self.alternative_options_morning),
            "itinerary_objects_noon": self.serialize_object(self.itinerary_objects_noon),
            "alternative_options_noon": self.serialize_object(self.alternative_options_noon),
            "itinerary_objects_night": self.serialize_object(self.itinerary_objects_night),
            "alternative_options_night": self.serialize_object(self.alternative_options_night),
            "difficulty": self.difficulty,
            "cost": self.cost,
            "location": self.location,
            "emailaddress": self.emailaddress
        }

        itinerary_dict = self.serialize_object(itinerary_dict)
        
        return itinerary_dict

    def populate_itinerary(self):
        """Populates the itinerary based on user difficulty preference and rating."""
        time_periods = ["Morning", "Noon", "Night"]
        itinerary_objects = {
            "Morning": self.itinerary_objects_morning,
            "Noon": self.itinerary_objects_noon,
            "Night": self.itinerary_objects_night
        }
        alternative_options = {
            "Morning": self.alternative_options_morning,
            "Noon": self.alternative_options_noon,
            "Night": self.alternative_options_night
        }

        for time_of_day in time_periods:
            # ✅ Fix: Query where time_of_day is either "All" or the specific period
            query = {"difficulty": self.difficulty, "$or": [{"time_of_day": "All"}, {"time_of_day": time_of_day}]}
            
            top_activities = list(mc.find(query).sort("Rating", -1).limit(3))
            itinerary_objects[time_of_day].extend(top_activities)

            # ✅ Handle Fallback to Lower Difficulty if Needed
            if len(top_activities) < 3:
                difficulty_fallback = {"Hard": "Medium", "Medium": "Easy"}
                if self.difficulty in difficulty_fallback:
                    fallback_query = {
                        "difficulty": difficulty_fallback[self.difficulty],
                        "$or": [{"time_of_day": "All"}, {"time_of_day": time_of_day}]
                    }
                    remaining_activities = list(
                        mc.find(fallback_query).sort("Rating", -1).limit(3 - len(top_activities))
                    )
                    itinerary_objects[time_of_day].extend(remaining_activities)

            # ✅ Get Alternative Options (Skipping the Top 3)
            alternative_activities = list(mc.find(query).sort("Rating", -1).skip(3))
            alternative_options[time_of_day].extend(alternative_activities)

        print("Itinerary successfully populated!")
        

        # for obj in self.itinerary_objects:
        #     # if obj.end_time <= itinerary_object_.start_time or obj.start_time >= itinerary_object_.end_time:
        #     new_itinerary.append(obj)
        #     self.objs_used[itinerary_object_.name] = True
        #     # else:
        #     if not inserted:
        #         new_itinerary.append(itinerary_object_)
        #         self.objs_used[itinerary_object_.name] = True
        #         inserted = True

        # if not inserted:
        #     new_itinerary.append(itinerary_object_)

        #self.itinerary_objects = new_itinerary

    # def remove_object(self, itinerary_object_: itinerary_object):
    #     isDeleted=False
    #     for i in self.itinerary_objects:
    #         if i == itinerary_object_:
    #             self.itinerary_objects.remove(i)
    #             isDeleted=True
    #             break
    #     if isDeleted == True:
    #         return True
    #     return False
    
    # def reschedule(self, itinerary_object_: itinerary_object, rescheduledTime):
    #     checkValidTime = self.checkValidItineraryObj(itinerary_object_, rescheduledTime)
    #     if checkValidTime == False:
    #         print("The timeslot you selected is invalid. Please try again.")
    #         return False
    #     isRemoved = self.remove_object(itinerary_object_)
    #     if isRemoved == False:
    #         print("Unable to reschedule as activity doesn't exist")
    #         return False
    #     #itinerary_object_.end_time
    #     itinerary_object_.start_time=rescheduledTime
    #     self.add_object(itinerary_object_)#not sure if this accounts for the end time.
        
    
    def checkValidItineraryObj(self, itinerary_object_, rescheduledTime):
        tod=itinerary_object_.activity['TOD']  #All, morning, noon, night
        desiredTOD=""   #morning, noon, or night -->
        if "A.M" in rescheduledTime or "AM" in rescheduledTime:
            desiredTOD="Morning"
        elif int(rescheduledTime[0])<=6:
            desiredTOD="Noon"
        else:
            desiredTOD = "Night"
        
        if desiredTOD == tod or tod == "All":
            return True
        return False


# def create_itinerary(difficulty, cost):

#     itinerary_ = itinerary(difficulty, cost, location=None)
#     itinerary_.populate_itinerary()
#     return None

# create_itinerary("Hard", 2)

