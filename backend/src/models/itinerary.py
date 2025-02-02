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

        self.objects_used = {}

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
        query = {"difficulty": self.difficulty, "park": self.location, "length": "Entire"}
        top_activities = list(mc.find(query).sort("Rating", -1).limit(2))
        if top_activities:
            self.itinerary_objects_morning.extend([top_activities[0]])
            self.itinerary_objects_noon.extend([top_activities[0]])
            self.itinerary_objects_night.extend([top_activities[0]])
            self.alternative_options_morning.extend([top_activities[1]])
            self.alternative_options_noon.extend([top_activities[1]])
            self.alternative_options_night.extend([top_activities[1]])
            return
        
        time_periods = ["Morning", "Noon", "Night"]
        for idx, time_of_day in enumerate(time_periods):
            query = {"difficulty": self.difficulty, "park": self.location, "time_of_day": time_of_day}
            top_activities = list(mc.find(query).sort("Rating", -1))
            for activity in top_activities:
                if len(itinerary_objects[time_of_day]) < 2:
                    itinerary_objects[time_of_day].append(activity)
                else:
                    alternative_options[time_of_day].append(activity)

        difficulty_map = {
            "Hard": "Medium",
            "Medium": "Easy",
            "Easy": "gone"
        }

        for idx, time_of_day in enumerate(time_periods):
            end = False
            curr_diff = self.difficulty
            while curr_diff in difficulty_map: 
                query = {"difficulty": curr_diff, "park": self.location, "time_of_day": "All"}
                remaining = 2 - len(itinerary_objects[time_of_day])
                if remaining <= 0:
                    break
                top_activities = list(mc.find(query).sort("Rating", -1))
                for activity in top_activities:
                    if activity['name'] in self.objects_used:
                        continue
                    if len(itinerary_objects[time_of_day]) < 2:
                        itinerary_objects[time_of_day].append(activity)
                    else:
                        end = True
                        break
                    self.objects_used[activity['name']] = True
                curr_diff = difficulty_map[curr_diff]
                if end:
                    break

        for idx, time_of_day in enumerate(time_periods):
            end = False
            curr_diff = self.difficulty
            while curr_diff in difficulty_map: 
                query = {"difficulty": curr_diff, "park": self.location, "time_of_day": "All"}
                remaining = 2 - len(alternative_options[time_of_day])
                if remaining <= 0:
                    break
                top_activities = list(mc.find(query).sort("Rating", -1))
                for activity in top_activities:
                    if activity['name'] in self.objects_used:
                        continue
                    if len(alternative_options[time_of_day]) < 2:
                        alternative_options[time_of_day].append(activity)
                    else:
                        end = True
                        break
                    self.objects_used[activity['name']] = True
                if end:
                    break
                curr_diff = difficulty_map[curr_diff]

    # def populate_itinerary(self):
    #     """Populates the itinerary based on user difficulty preference and rating."""
    #     time_periods = ["Morning", "Noon", "Night"]
    #     itinerary_objects = {
    #         "Morning": self.itinerary_objects_morning,
    #         "Noon": self.itinerary_objects_noon,
    #         "Night": self.itinerary_objects_night
    #     }
    #     alternative_options = {
    #         "Morning": self.alternative_options_morning,
    #         "Noon": self.alternative_options_noon,
    #         "Night": self.alternative_options_night
    #     }

    #     for idx, time_of_day in enumerate(time_periods):
    #         # ✅ Fix: Query where time_of_day is either "All" or the specific period
    #         limit_amt = idx + 1
    #         query = {"difficulty": self.difficulty, "park": self.location, "$or": [{"time_of_day": "All"}, {"time_of_day": time_of_day}]}
            
    #         top_activities = list(mc.find(query).sort("Rating", -1).limit(limit_amt * 2))
    #         res = []
    #         finished = False
    #         finished_Two = False
    #         if time_of_day == "Morning":
    #             for activity in top_activities:
    #                 if activity['length'] == "Entire":
    #                     itinerary_objects['Morning'].extend([activity])
    #                     itinerary_objects['Noon'].extend([activity])
    #                     itinerary_objects['Night'].extend([activity])
    #                     finished = True
    #                     res.append(activity)
    #                     break
    #                 elif float(activity['length']) >= 6:
    #                     top_activities = [activity]
    #                     finished_two = True
    #                     break
    #         if not(finished):
    #             for activity in top_activities:
    #                 if activity['name'] in self.objects_used:
    #                     continue
    #                 else:
    #                     self.objects_used[activity['name']] = True
    #                     res.append(activity)
    #             if time_of_day == "Morning":
    #                 print(res)
    #             itinerary_objects[time_of_day].extend(res)

    #         # ✅ Handle Fallback to Lower Difficulty if Needed
    #         if len(res) < 2 and (not(finished) or not(finished_two)):
    #             difficulty_fallback = {"Hard": "Medium", "Medium": "Easy"}
    #             if self.difficulty in difficulty_fallback:
    #                 fallback_query = {
    #                     "difficulty": difficulty_fallback[self.difficulty], "park": self.location,
    #                     "$or": [{"time_of_day": "All"}, {"time_of_day": time_of_day}]
    #                 }
    #                 remaining_activities = list(
    #                     mc.find(fallback_query).sort("Rating", -1).limit(7 - len(top_activities))
    #                 )
    #                 for activity in remaining_activities:
    #                     if activity['name'] in self.objects_used:
    #                         continue
    #                     else:
    #                         self.objects_used[activity['name']] = True
    #                         res.append(activity)
    #                     if len(res) >= 2:
    #                         break
    #                 itinerary_objects[time_of_day].extend(res)
                    
    #         # ✅ Get Alternative Options (Skipping the Top 3)
    #         if not(finished):
    #             alternative_activities = list(mc.find(query).sort("Rating", -1).skip(2))
    #             alternative_options[time_of_day].extend(alternative_activities)
    #         else:
    #             alternative_activities = list(mc.find(query).sort("Rating", -1).skip(1).limit(2))
    #             alternative_options["Noon"].extend(alternative_activities)
    #             alternative_options["Night"].extend(alternative_activities)
    #             alternative_options["Morning"].extend(alternative_activities)

    #         if finished:
    #             break

    #     print("Itinerary successfully populated!")
        

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

