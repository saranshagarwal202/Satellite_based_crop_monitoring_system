from pymongo import MongoClient

# Connect to MongoDB container
client = MongoClient("mongodb://localhost:27017/")

# Create or access the database
db = client['metadata_store']

# Access collections
crop_field_metadata = db['crop_field_metadata']
vegetation_indices = db['vegetation_indices']
model_predictions = db['model_predictions']
aoi_metadata = db['aoi_metadata']
scene_image_metadata = db['scene_image_metadata']

print("Crop Field Metadata Documents:")
for doc in crop_field_metadata.find():
    print(doc)

print("\nVegetation Indices Documents:")
for doc in vegetation_indices.find():
    print(doc)

print("\nModel Predictions Documents:")
for doc in model_predictions.find():
    print(doc)

print("\nAOI Metadata Documents:")
for doc in aoi_metadata.find():
    print(doc)

print("\nScene Image Metadata Documents:")
for doc in scene_image_metadata.find():
    print(doc)
