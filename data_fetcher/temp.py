import os
import json
import requests
from requests.auth import HTTPBasicAuth
import rasterio
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

def search_and_download_image(api_key, search_filter):
    # Authentication
    auth = HTTPBasicAuth(api_key, '')
    
    # Search API request
    search_url = "https://api.planet.com/data/v1/quick-search"
    search_result = requests.post(search_url, auth=auth, json=search_filter)
    
    if search_result.status_code != 200:
        raise Exception(f"Search request failed with status code {search_result.status_code}")
    
    # Get first item from search results
    items = search_result.json()["features"]
    if not items:
        raise Exception("No items found matching the search criteria")
    
    item = items[0]
    item_id = item["id"]
    item_type = item["properties"]["item_type"]
    
    # Get item assets
    assets_url = f"https://api.planet.com/data/v1/item-types/{item_type}/items/{item_id}/assets"
    assets_result = requests.get(assets_url, auth=auth)
    
    if assets_result.status_code != 200:
        raise Exception(f"Assets request failed with status code {assets_result.status_code}")
    
    assets = assets_result.json()
    
    # Activate ortho_analytic_4b asset
    ortho_analytic_4b_activation_url = assets["ortho_analytic_4b"]["_links"]["activate"]
    activation_result = requests.get(ortho_analytic_4b_activation_url, auth=auth)
    
    if activation_result.status_code != 204:
        raise Exception(f"Asset activation failed with status code {activation_result.status_code}")
    
    # Download image
    download_url = assets["ortho_analytic_4b"]["location"]
    image_result = requests.get(download_url, auth=auth)
    
    if image_result.status_code != 200:
        raise Exception(f"Image download failed with status code {image_result.status_code}")
    
    # Save image to file
    with open(f"{item_id}.tif", "wb") as f:
        f.write(image_result.content)
    
    return item_id

def process_and_display_image(item_id):
    # Open the image using rasterio
    with rasterio.open(f"{item_id}.tif") as src:
        # Read the first three bands (assuming RGB)
        r, g, b = src.read(1), src.read(2), src.read(3)
    
    # Scale the data to 0-255
    rgb = np.dstack((r, g, b))
    rgb = ((rgb - rgb.min()) / (rgb.max() - rgb.min()) * 255).astype(np.uint8)
    
    # Display the image
    plt.figure(figsize=(12, 8))
    plt.imshow(rgb)
    plt.title(f"Image ID: {item_id}")
    plt.axis('off')
    plt.show()

def main():
    # Load API key from environment variable
    api_key = os.environ.get("PLANET_API_KEY")
    if not api_key:
        raise ValueError("PLANET_API_KEY environment variable not set")

    # Example search filter (you can modify this or load from a file)
    search_filter = {
        "type": "AndFilter",
        "config": [
            {
                "type": "DateRangeFilter",
                "field_name": "acquired",
                "config": {
                    "gte": (datetime.now() - timedelta(days=10)).isoformat() + "Z",
                    "lte": datetime.now().isoformat() + "Z"
                }
            },
            {
                "type": "GeometryFilter",
                "field_name": "geometry",
                "config": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-122.4194, 37.7749],
                            [-122.4194, 37.8049],
                            [-122.3894, 37.8049],
                            [-122.3894, 37.7749],
                            [-122.4194, 37.7749]
                        ]
                    ]
                }
            },
            {
                "type": "RangeFilter",
                "field_name": "cloud_cover",
                "config": {"lte": 0.1}
            }
        ]
    }

    try:
        item_id = search_and_download_image(api_key, search_filter)
        process_and_display_image(item_id)
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()