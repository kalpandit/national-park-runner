from flask import Flask
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Correct URI with TLS
uri = "mongodb+srv://sibi-tiruchi:B0N0DNce3GnIBF5v@cluster0.qoz8v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# Create client with TLS settings
client = MongoClient(uri, tls=True, server_api=ServerApi('1'))

# Test connection
try:
    print("here")
    client.admin.command('ping')
    print("here")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")



# Flask app
app = Flask(__name__)
app.config["MONGO_URI"] = uri
db = client['musicDB']
collection = db['tracks']



@app.route("/")
def hello_world():
    track = {"title": "New Song", "artist": "New Artist", "duration": 200, "danceability": 0.9}
    result = collection.insert_one(track)
    return "<p>Hello, World!</p>"

app.run(debug=True, port=5001)

print("bitch")