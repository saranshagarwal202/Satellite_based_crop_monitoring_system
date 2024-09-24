"""
Given date range, aoi_polygon, and cloud cover range, populates scenes into the given queue
"""

import requests
import time
import os
from queue import Queue

PLANET_API_KEY = None

def __get_auth_headers():
    headers = {'Authorization': f'api-key {PLANET_API_KEY}'}
    return headers

def __generate_search_filter(start_date, end_date, aoi_polygon, cloud_cover, item_types):
    search_filter = {
        "item_types": item_types,
        "filter": {
            "type": "AndFilter",
            "config": [
                {
                    "type": "GeometryFilter",
                    "field_name": "geometry",
                    "config": {"type": "Polygon",
                    "coordinates": [aoi_polygon]}
                },
                {
                    "type": "RangeFilter",
                    "field_name": "cloud_cover",
                    "config": {
                        "gte": cloud_cover[0],
                        "lte": cloud_cover[1]
                    }
                },
                {
                    "type": "DateRangeFilter",
                    "field_name": "acquired",
                    "config": {
                        "gte": start_date + "T00:00:00Z",
                        "lte": end_date + "T23:59:59Z"
                    }
                }
            ]
        }
    }

    return search_filter

def __search_for_scenes(start_date, end_date, aoi_polygon, cloud_cover, item_types=["PSScene"]):
    try:
        # Generate the search filter
        search_filter = __generate_search_filter(start_date, end_date, aoi_polygon, cloud_cover, item_types)
        
        # Set the search URL
        search_url = "https://api.planet.com/data/v1/quick-search"
        
        # Send the POST request
        response = requests.post(search_url, headers=__get_auth_headers(), json=search_filter)
        response.raise_for_status() 

        # Parse the response data
        data = response.json()

        # Extract image IDs from the search results
        if 'features' in data:
            image_ids = [feature['id'] for feature in data['features']]
            return image_ids
        else:
            print("No 'features' found in the response.")
            return []

    except requests.exceptions.RequestException as e:
        print(f"HTTP request error: {e}")
        return []
    except ValueError as e:
        print(f"Error parsing JSON response: {e}")
        return []
    except KeyError as e:
        print(f"Key error: Missing expected data in response: {e}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []

def __download_image(image_id, asset_type="ortho_visual"):
    try:
        # Activate asset_type
        assets_url = f"https://api.planet.com/data/v1/item-types/PSScene/items/{image_id}/assets/"
        
        # Fetch available assets for the image
        response = requests.get(assets_url, headers=__get_auth_headers())
        response.raise_for_status()  
        
        assets = response.json()
        if asset_type not in assets:
            print(f"Asset type '{asset_type}' not found for image {image_id}.")
            return None
        
        # Activate the asset
        activate_url = assets[asset_type]['_links']['activate']
        activate_response = requests.get(activate_url, headers=__get_auth_headers())
        activate_response.raise_for_status()

        # Poll for asset status
        while True:
            response = requests.get(assets_url, headers=__get_auth_headers())
            response.raise_for_status() 
            assets = response.json()
            asset_status = assets[asset_type]['status']

            if asset_status == 'active':
                download_url = assets[asset_type]['location']
                download_response = requests.get(download_url, headers=__get_auth_headers())
                download_response.raise_for_status()
                return download_response.content

            else:
                # Wait before rechecking status
                print(f"Asset {asset_type} not yet active. Status: {asset_status}. Retrying in 30 seconds.")
                time.sleep(30)

    except requests.exceptions.RequestException as e:
        print(f"An HTTP error occurred while downloading image {image_id}: {e}")
        return None
    except KeyError as e:
        print(f"Key error: {e} in the asset data for image {image_id}.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None


def __run_scene_downloader(image_ids, image_queue):
    try:
        # Download images into queue
        for image_id in image_ids:
            image_data = __download_image(image_id)
            if image_data:
                image_queue.put_nowait((image_id, image_data))
        
        # Return True if all downloads succeed
        image_queue.put_nowait("eos") # eos represents end of stream 
        return True

    except Exception as e:
        print(f"An error occurred: {e}")  # Print the exception message
        # Return False if an exception occurs
        return False 


def download_scenes_to_queue(
        start_date: str, # format YYYY-MM-DD
        end_date: str, # format YYYY-MM-DD
        aoi_polygon: list,
        cloud_cover: tuple, # Tuple. Eg. (0.1, 0.5), edge values inclusive. 
        image_queue: Queue,
        api_key: str = None
):
    if not api_key:
        globals()["PLANET_API_KEY"] = os.getenv("PLANET_API_KEY")
    else:
        globals()["PLANET_API_KEY"] = api_key
    image_ids = __search_for_scenes(start_date, end_date, aoi_polygon, cloud_cover)
    task_completion_status = __run_scene_downloader(image_ids, image_queue)
    
        
    return task_completion_status
