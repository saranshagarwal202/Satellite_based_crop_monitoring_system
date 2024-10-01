import json
from pymongo import MongoClient
from datetime import datetime

# Load the JSON data
with open('mongodb_data.json') as f:
    data = json.load(f)

# Convert string dates to datetime objects
def convert_dates(doc):
    for key, value in doc.items():
        if isinstance(value, str) and ("date" in key or "time_stamp" in key):
            doc[key] = datetime.fromisoformat(value)
        elif isinstance(value, dict):
            convert_dates(value)
    return doc

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['metadata_store']

# Insert documents into each collection
for collection_name, documents in data.items():
    collection = db[collection_name]
    for doc in documents:
        doc = convert_dates(doc)  # Convert dates before insertion
        collection.insert_one(doc)

print("Documents inserted successfully from JSON!")
