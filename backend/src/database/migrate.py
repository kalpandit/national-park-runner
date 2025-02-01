import pandas as pd
from collections import defaultdict
import json
# from database import mongo

def convert_json(file_path="nationalparks.csv"):

    df = pd.read_csv(file_path)

    national_parks = defaultdict(list)
    for idx, value in df.iterrows():

        activity = {}
        activity['name'] = value['Name']
        activity['type'] = value['Type']
        activity['difficulty'] = value['Difficulty']
        activity['length'] = value['Length']
        activity['Accessible'] = value['Accessible']
        activity['Education'] = value['Education']
        activity['Rating'] = value['Rating']
        activity['time_of_day'] = value['TOD']
    
        national_parks[value['National Park']].append(activity)

    # json_string = json.dumps(national_parks)
    # print(json_string)
    return national_parks



def seed_data():

    json_string = convert_json("nationalparks.csv")
    