{
  "crop_field_metadata": [
    {
      "id": "field1",
      "aoi": "aoi1",
      "area": 120.5,
      "plantation_date": "2023-04-01",
      "harvest_date": "2023-09-30",
      "yield_amount": 1500,
      "aggregate_metrics": {
        "ndvi": 0.85,
        "evi": 0.78
      }
    }
  ],
  "vegetation_indices": [
    {
      "id": "veg_index_1",
      "field_id": "field1",
      "ndvi": 0.85,
      "evi": 0.78,
      "calculation_date": "2023-06-15",
      "sensor": "Sentinel-2"
    }
  ],
  "model_predictions": [
    {
      "id": "pred_1",
      "field_id": "field1",
      "prediction_date": "2023-06-30",
      "prediction_yield": 1450,
      "model_identifier": "yield_model_v1",
      "confidence_interval": {
        "lower_bound": 1400,
        "upper_bound": 1500
      }
    }
  ],
  "aoi_metadata": [
    {
      "id": "aoi1",
      "image_id": "img_001",
      "aoi_polygon": {
        "type": "Polygon",
        "coordinates": [[30.0, -120.0], [30.5, -120.5], [31.0, -121.0], [30.0, -120.0]]
      },
      "time_stamp": "2023-04-01",
      "cloud_cover": 0.1,
      "scenes": ["scene_1", "scene_2"]
    }
  ],
  "scene_image_metadata": [
    {
      "id": "scene_1",
      "image_id": "img_001",
      "scene_cloud_cover": 0.1,
      "time_stamp": "2023-04-01",
      "bands": ["R", "G", "B", "NIR"],
      "resolution": 10,
      "planet_image_id": "planet_001"
    }
  ]
}
