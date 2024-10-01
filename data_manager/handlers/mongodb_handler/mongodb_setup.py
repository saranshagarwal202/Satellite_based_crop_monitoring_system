from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb://localhost:27017/")

db = client['metadata_store']

crop_field_metadata = db['crop_field_metadata']
vegetation_indices = db['vegetation_indices']
model_predictions = db['model_predictions']
aoi_metadata = db['aoi_metadata']
scene_image_metadata = db['scene_image_metadata']

crop_field_doc = {
    "id": "field1",
    "aoi": "aoi1",
    "area": 120.5,
    "plantation_date": datetime(2023, 4, 1),
    "harvest_date": datetime(2023, 9, 30),
    "yield_amount": 1500,
    "aggregate_metrics": {
        "ndvi": 0.85,
        "evi": 0.78
    }
}

vegetation_indices_doc = {
    "id": "veg_index_1",
    "field_id": "field1",
    "ndvi": 0.85,
    "evi": 0.78,
    "calculation_date": datetime(2023, 6, 15),
    "sensor": "Sentinel-2"
}

model_predictions_doc = {
    "id": "pred_1",
    "field_id": "field1",
    "prediction_date": datetime(2023, 6, 30),
    "prediction_yield": 1450,
    "model_identifier": "yield_model_v1",
    "confidence_interval": {
        "lower_bound": 1400,
        "upper_bound": 1500
    }
}

aoi_metadata_doc = {
    "id": "aoi1",
    "image_id": "img_001",
    "aoi_polygon": {
        "type": "Polygon",
        "coordinates": [[30.0, -120.0], [30.5, -120.5], [31.0, -121.0], [30.0, -120.0]]
    },
    "time_stamp": datetime(2023, 4, 1),
    "cloud_cover": 0.1,
    "scenes": ["scene_1", "scene_2"]
}

scene_image_metadata_doc = {
    "id": "scene_1",
    "image_id": "img_001",
    "scene_cloud_cover": 0.1,
    "time_stamp": datetime(2023, 4, 1),
    "bands": ["R", "G", "B", "NIR"],
    "resolution": 10,
    "planet_image_id": "planet_001"
}

crop_field_metadata.insert_one(crop_field_doc)
vegetation_indices.insert_one(vegetation_indices_doc)
model_predictions.insert_one(model_predictions_doc)
aoi_metadata.insert_one(aoi_metadata_doc)
scene_image_metadata.insert_one(scene_image_metadata_doc)

print("Documents inserted successfully!")
