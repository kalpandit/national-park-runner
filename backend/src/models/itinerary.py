from itinerary_object import itinerary_object
from pymongo import MongoClient
from user import user


class itinerary:

    def __init__(self, difficulty, cost):

        # A list of itinerary_objects
        self.itinerary_objects_morning = []
        self.alternative_options_morning= []

        self.itinerary_objects_noon = []
        self.alternative_options_noon= []

        self.itinerary_objects_night = []
        self.alternative_options_night= []

        self.difficulty=difficulty
        self.cost=cost

        self.objs_used = {}
        self.food = True
    
    def populate_itinerary(self, itinerary_object_: itinerary_object):
        new_itinerary = []
        self.objs_used.clear()
        inserted = False

        client = MongoClient("mongodb://localhost:27017/")  # check if this is correct
        db = client["npr_db"]  # Replace with your database name
        collection = db["model_collection"]  # Replace with your collection name

        


        #find out how to querey mangodb to find the most popular activities based on the user --> if user likes medium difficulty automatically populate
        #the mornign afternoon and night with 5 star medium difficulty ratings and if there aren't enough, then go down to easy rating

        # time_filter = {} if self. == "all" else {"time_of_day": preferred_time}
    

        query = {"difficulty": self.difficulty , "time_of_day": "Morning" }  # Filter by difficulty and time of day
        top_activities = collection.find(query).sort("Rating", -1).limit(3)  # Sort by Rating (descending)
        top_3_morning=list(top_activities)
        self.itinerary_objects_morning.append(top_3_morning)
        
        if len(top_3_morning)<3:
            #work on this logic later
                    

        

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

        self.itinerary_objects = new_itinerary

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


def create_itinerary(user_: user):

    itinerary_ = itinerary()
    cost = user_.tags.get("cost", None)
    difficulty = user_.tags.get("difficulty", "Hard")

    # Select 
    options = "MONGO DB QUERY"  # sort by rating
    activity_options = "MONGO DB QUERY" # sort by rating, include difficulty --> decrease the rating 
    food_options = "MONGO DB QUERY" # potentially set up YELP API???

    for activity in activity_options:
        itinerary_.add_object()

    return itinerary_


