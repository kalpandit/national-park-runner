#testing
class itinerary_object:

    def __init__(self, activity, start_time, tags = {}):


        self.start_time = start_time
        self.end_time = self.tags.get("length", 12)+start_time
        self.activity = activity
        self.tags = tags

    
