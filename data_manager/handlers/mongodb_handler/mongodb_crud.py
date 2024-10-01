from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb://localhost:27017/")
db = client['metadata_store']

crop_field_metadata = db['crop_field_metadata']

# CREATE (Insert a new document)
def create_crop_field(doc):
    result = crop_field_metadata.insert_one(doc)
    print(f"Document inserted with ID: {result.inserted_id}")

# READ (Find documents by a filter, or find all documents)
def read_crop_field(filter_query={}):
    documents = crop_field_metadata.find(filter_query)
    return list(documents)

# UPDATE (Update an existing document by a filter)
def update_crop_field(filter_query, update_data):
    result = crop_field_metadata.update_one(filter_query, {'$set': update_data})
    print(f"Matched {result.matched_count}, Updated {result.modified_count}")

# DELETE (Delete one or more documents by a filter)
def delete_crop_field(filter_query):
    result = crop_field_metadata.delete_one(filter_query)
    print(f"Deleted {result.deleted_count} document(s)")

# Example usage:
if __name__ == "__main__":
    # Example document to insert
    crop_field_doc = {
        "id": "field2",
        "aoi": "aoi2",
        "area": 100.0,
        "plantation_date": datetime(2023, 5, 1),
        "harvest_date": datetime(2023, 10, 30),
        "yield_amount": 1200,
        "aggregate_metrics": {
            "ndvi": 0.9,
            "evi": 0.8
        }
    }

    # CREATE
    create_crop_field(crop_field_doc)

    # READ
    print("Reading documents:")
    docs = read_crop_field({"id": "field2"})
    for doc in docs:
        print(doc)

    # UPDATE
    update_crop_field({"id": "field2"}, {"yield_amount": 1300})

    # DELETE
    delete_crop_field({"id": "field2"})
