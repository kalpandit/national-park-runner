class user:

    def __init__(self, username, password, allergies, accessability, cost, difficulty = {}):
        self.username = username
        self.password = password
        self.tags = tags
    
    def modify_user_information(self, typeChange, newValue):
        if typeChange == "allergies":
            self.allergies=newValue
        elif typeChange == "accessability":
            self.accessability=newValue
        elif typeChange == "cost":
            self.cost=newValue
        elif typeChange == "difficulty":
            self.difficulty=newValue

    



