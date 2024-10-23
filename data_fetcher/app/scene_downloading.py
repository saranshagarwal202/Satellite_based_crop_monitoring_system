"""
Given date range, aoi_polygon, and cloud cover range, populates scenes into the given queue
"""

import requests
import time
import os
from queue import Queue
from logging import getLogger
PLANET_API_KEY = None
PLANET_API_URL = os.environ.get("PLANET_API_URL")
logger = getLogger()


def _get_auth_headers_():
    headers = {'Authorization': f'api-key {PLANET_API_KEY}'}
    return headers


def _generate_search_filter_(start_date, end_date, aoi_polygon, item_types):
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
                        "gte": 0,
                        "lte": 0.1
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


def _search_for_scenes_(job_id, start_date, end_date, aoi_polygon, item_types=["PSScene"]):
    try:
        # Generate the search filter
        search_filter = _generate_search_filter_(
            start_date, end_date, aoi_polygon, item_types)

        # Set the search URL
        search_url = f"{PLANET_API_URL}/data/v1/quick-search"

        # Send the POST request
        response = requests.post(
            search_url, headers=_get_auth_headers_(), json=search_filter)
        response.raise_for_status()

        # Parse the response data
        data = response.json()

        # Extract image IDs from the search results
        if 'features' in data:
            image_ids = [feature['id'] for feature in data['features']]
            return image_ids
        else:
            logger.info(
                f"job_id: {job_id} - No 'features' found in the response.")
            return []

    except requests.exceptions.RequestException as e:
        logger.error(f"job_id: {job_id} - HTTP request error: {e}")
        return []
    except ValueError as e:
        logger.error(f"job_id: {job_id} - Error parsing JSON response: {e}")
        return []
    except KeyError as e:
        logger.error(
            f"job_id: {job_id} - Key error: Missing expected data in response: {e}")
        return []


def _activate_image_(job_id, image_id, asset_type="ortho_visual"):
    try:
        # Activate asset_type
        assets_url = f"{PLANET_API_URL}/data/v1/item-types/PSScene/items/{image_id}/assets/"

        # Fetch available assets for the image
        response = requests.get(assets_url, headers=_get_auth_headers_())
        response.raise_for_status()

        assets = response.json()
        if asset_type not in assets:
            logger.error(
                f"job_id: {job_id} - Asset type '{asset_type}' not found for image {image_id}.")
            return None

        # Activate the asset
        activate_url = assets[asset_type]['_links']['activate']
        # 'https://api.planet.com/data/v1/assets/{_id}/activate'
        activate_response = requests.get(
            activate_url, headers=_get_auth_headers_())
        activate_response.raise_for_status()
        # return status 202 with no content
        return assets_url

    except requests.exceptions.RequestException as e:
        logger.error(
            f"job_id: {job_id} - An HTTP error occurred while downloading image {image_id}: {e}")
        return None
    except KeyError as e:
        logger.error(
            f"job_id: {job_id} - Key error: {e} in the asset data for image {image_id}.")
        return None


def _download_image_(job_id, image_id, assets_url, asset_type="ortho_visual"):
    try:
        # Poll for asset status
        while True:
            # 'https://api.planet.com/data/v1/item-types/PSScene/items/20230517_161219_25_2430/assets/'
            response = requests.get(assets_url, headers=_get_auth_headers_())
            response.raise_for_status()
            assets = response.json()
            asset_status = assets[asset_type]['status']

            if asset_status == 'active':
                download_url = assets[asset_type]['location']
                # 'https://api.planet.com/data/v1/download?token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbWN4ekNTUmRSem01UERZMWxvSUZFY010bjR5LXVUdVBCSVd5N2dad2pYT3gtVVR4RHluc2hMVENNVmJHMTdUQ1EwXzA0Mnhjb1RGQmkwU2FfYnJBZz09IiwiZXhwIjoxNzI4MDAxMDMxLCJ0b2tlbl90eXBlIjoidHlwZWQtaXRlbSIsIml0ZW1fdHlwZV9pZCI6IlBTU2NlbmUiLCJpdGVtX2lkIjoiMjAyMzA1MTdfMTYxMjE5XzI1XzI0MzAiLCJhc3NldF90eXBlIjoib3J0aG9fdmlzdWFsIn0.sqe0hcBqTKSdU-9Zna39Wpo4emuu8vnJaWE4gTS0RElDKOR9H73lb0SX5IjGZB1PiIcTFgyqiaTobGUPa14kJQ'
                download_response = requests.get(
                    download_url, headers=_get_auth_headers_())
                download_response.raise_for_status()
                return download_response.content

            else:
                # Wait before rechecking status
                logger.debug(
                    f"job_id: {job_id} - Asset {asset_type} not yet active. Status: {asset_status}. Retrying in 30 seconds.")
                time.sleep(30)

    except requests.exceptions.RequestException as e:
        logger.error(
            f"job_id: {job_id} - An HTTP error occurred while downloading image {image_id}: {e}")
        return None
    except KeyError as e:
        logger.error(
            f"job_id: {job_id} - Key error: {e} in the asset data for image {image_id}.")
        return None


def _run_scene_downloader_(job_id, image_ids, image_queue):
    # First activate images so planet api can start processing them
    assets_urls = []
    for image_id in image_ids:
        try:
            assets_urls.append(_activate_image_(job_id, image_id))
        except BaseException as e:
            logger.error(
                f"job_id: {job_id} - Failed to activate asset for image_id: {image_id}. error msg: {e}")

    for i, image_id in enumerate(image_ids):
        try:
            image_data = _download_image_(job_id, image_id, assets_urls[i])
            if image_data:
                image_queue.put_nowait((image_id, image_data))
                # giving parent thread time to process and save image
                time.sleep(10)
        except BaseException as e:
            logger.error(
                f"job_id: {job_id} - Failed to download asset for image_id: {image_id}. error msg: {e}")

    # Return True if all downloads succeed
    image_queue.put_nowait(("eos", "eos"))  # eos represents end of stream
    return True


def download_scenes_to_queue(
        job_id: str,
        start_date: str,  # format YYYY-MM-DD
        end_date: str,  # format YYYY-MM-DD
        aoi_polygon: list,
        image_queue: Queue,
        api_key: str = None
):
    if not api_key:
        globals()["PLANET_API_KEY"] = os.getenv("PLANET_API_KEY")
    else:
        globals()["PLANET_API_KEY"] = api_key
    image_ids = _search_for_scenes_(job_id, start_date, end_date, aoi_polygon)
    if len(image_ids) > 0:
        task_completion_status = _run_scene_downloader_(
            job_id, image_ids, image_queue)

    # return task_completion_status
