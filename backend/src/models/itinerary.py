from itinerary_object import itinerary_object
from user import user


class itinerary:

    def __init__(self):

        # A list of itinerary_objects
        self.itinerary_objects = []
        self.alternative_options = []
        self.objs_used = {}
        self.food = True
    
    def add_object(self, itinerary_object_: itinerary_object):
        new_itinerary = []
        self.objs_used.clear()
        inserted = False

        for obj in self.itinerary_objects:
            if obj.end_time <= itinerary_object_.start_time or obj.start_time >= itinerary_object_.end_time:
                new_itinerary.append(obj)
                self.objs_used[itinerary_object_.name] = True
            else:
                if not inserted:
                    new_itinerary.append(itinerary_object_)
                    self.objs_used[itinerary_object_.name] = True
                    inserted = True

        if not inserted:
            new_itinerary.append(itinerary_object_)

        self.itinerary_objects = new_itinerary

    def remove_object(self, itinerary_object_: itinerary_object):
        isDeleted=False
        for i in self.itinerary_objects:
            if i == itinerary_object_:
                self.itinerary_objects.remove(i)
                isDeleted=True
                break
        if isDeleted == True:
            return True
        return False
    
    def reschedule(self, itinerary_object_: itinerary_object, rescheduledTime):
        checkValidTime = self.checkValidItineraryObj(itinerary_object_, rescheduledTime)
        if checkValidTime == False:
            print("The timeslot you selected is invalid. Please try again.")
            return False
        isRemoved = self.remove_object(itinerary_object_)
        if isRemoved == False:
            print("Unable to reschedule as activity doesn't exist")
            return False
        #itinerary_object_.end_time
        itinerary_object_.start_time=rescheduledTime
        self.add_object(itinerary_object_)#not sure if this accounts for the end time.
        
    
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


