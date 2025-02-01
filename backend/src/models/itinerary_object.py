#testing
class itinerary_object:

    def __init__(self, activity, time_of_day, rating, tags = {}):


        #self.start_time = start_time
        #self.end_time = self.tags.get("length", 12)+start_time
        self.time_of_day=time_of_day
        self.activity = activity
        self.rating=rating
        self.tags = tags

    
