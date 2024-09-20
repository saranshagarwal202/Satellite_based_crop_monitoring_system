import argparse
import yaml
from requests.auth import HTTPBasicAuth
import requests
import time
from enum import Enum
from datetime import datetime, timedelta


class Frequency(Enum):
    """Enum representing frequency options for date range generation."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


def authenticate(api_key):
    """Authenticate using the provided API key for the Planet API."""
    return HTTPBasicAuth(api_key)


def build_search_filter(start_date, end_date, aoi_polygon, cloud_cover):
    """
    Construct the search filter for querying Planet API.

    Args:
        start_date (str): Start date (YYYY-MM-DD).
        end_date (str): End date (YYYY-MM-DD).
        aoi_polygon (list): List of [longitude, latitude] pairs defining the area of interest.
        cloud_cover (float): Maximum cloud cover percentage.

    Returns:
        dict: The search filter to be used in the API request.
    """
    return {
        "type": "AndFilter",
        "config": [
            {
                "type": "DateRangeFilter",
                "field_name": "acquired",
                "config": {
                    "gte": f"{start_date}T00:00:00Z",
                    "lte": f"{end_date}T23:59:59Z"
                }
            },
            {
                "type": "GeometryFilter",
                "field_name": "geometry",
                "config": {
                    "type": "Polygon",
                    "coordinates": [aoi_polygon]
                }
            },
            {
                "type": "RangeFilter",
                "field_name": "cloud_cover",
                "config": {"lte": cloud_cover}
            }
        ]
    }


def search_images(auth, search_filter):
    """
    Perform the search for satellite images using the constructed filter.

    Args:
        auth (HTTPBasicAuth): Authentication object.
        search_filter (dict): Filter used for the search request.

    Returns:
        Response: Search result as a JSON response.

    Raises:
        Exception: If the API request fails.
    """
    search_url = "https://api.planet.com/data/v1/quick-search"
    response = requests.post(search_url, auth=auth, json=search_filter)
    if response.status_code != 200:
        raise Exception(f"Search request failed with status code {response.status_code}")
    return response


def get_first_image_item(search_result):
    """
    Extract the first image item from the search result.

    Args:
        search_result (Response): JSON response from the search query.

    Returns:
        tuple: item_id and item_type of the first image.

    Raises:
        Exception: If no items are found.
    """
    items = search_result.json().get("features", [])
    if not items:
        raise Exception("No items found matching the search criteria.")
    item = items[0]
    return item["id"], item["properties"]["item_type"]


def get_item_assets(auth, item_id, item_type):
    """
    Retrieve the assets associated with an image item.

    Args:
        auth (HTTPBasicAuth): Authentication object.
        item_id (str): The ID of the image item.
        item_type (str): The type of the image item.

    Returns:
        dict: JSON response containing the item assets.

    Raises:
        Exception: If the request fails.
    """
    assets_url = f"https://api.planet.com/data/v1/item-types/{item_type}/items/{item_id}/assets"
    response = requests.get(assets_url, auth=auth)
    if response.status_code != 200:
        raise Exception(f"Assets request failed with status code {response.status_code}")
    return response.json()


def activate_asset(auth, asset):
    """
    Activate the asset for download.

    Args:
        auth (HTTPBasicAuth): Authentication object.
        asset (dict): Asset information from the API.

    Raises:
        Exception: If asset activation fails.
    """
    activation_url = asset["_links"]["activate"]
    response = requests.get(activation_url, auth=auth)
    if response.status_code != 204:
        raise Exception(f"Asset activation failed with status code {response.status_code}")


def wait_for_asset_activation(auth, assets_url):
    """
    Poll the asset status until it is ready for download.

    Args:
        auth (HTTPBasicAuth): Authentication object.
        assets_url (str): URL to check the asset status.

    Returns:
        str: Download URL for the asset when active.

    Raises:
        Exception: If the asset fails to activate within a reasonable timeframe.
    """
    while True:
        response = requests.get(assets_url, auth=auth)
        asset_status = response.json()["ortho_analytic_4b"]["status"]

        if asset_status == 'active':
            return response.json()["ortho_analytic_4b"]["location"]

        print(f"Asset is still {asset_status}, retrying in 30 seconds...")
        time.sleep(30)


def download_image(auth, download_url, item_id):
    """
    Download the activated image.

    Args:
        auth (HTTPBasicAuth): Authentication object.
        download_url (str): URL to download the image.
        item_id (str): The ID of the image item.

    Raises:
        Exception: If the download request fails.
    """
    response = requests.get(download_url, auth=auth)
    if response.status_code != 200:
        raise Exception(f"Image download failed with status code {response.status_code}")
    
    file_path = f"{item_id}.tif"
    with open(file_path, "wb") as file:
        file.write(response.content)
    print(f"Downloaded image: {file_path}")


def generate_date_ranges(start_date, end_date, frequency):
    """
    Generate date ranges based on the frequency.

    Args:
        start_date (str): Start date (YYYY-MM-DD).
        end_date (str): End date (YYYY-MM-DD).
        frequency (str): Frequency value ("daily", "weekly", "monthly").

    Returns:
        list: List of (start_date, end_date) tuples for each interval.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    date_ranges = []
    delta = {
        Frequency.DAILY.value: timedelta(days=1),
        Frequency.WEEKLY.value: timedelta(weeks=1),
        Frequency.MONTHLY.value: timedelta(weeks=4)  # Approximate a month as 4 weeks
    }[frequency]

    while start < end:
        range_end = min(start + delta, end)
        date_ranges.append((start.strftime("%Y-%m-%d"), range_end.strftime("%Y-%m-%d")))
        start = range_end
    
    return date_ranges


def main():
    """Main entry point for the script, handles configuration and API interactions."""
    parser = argparse.ArgumentParser(description="Planet API Satellite Image Downloader")
    parser.add_argument("--config", required=True, help="Path to the YAML configuration file")
    args = parser.parse_args()

    with open(args.config, 'r') as file:
        config = yaml.safe_load(file)

    auth = authenticate(config['api_key'])
    date_ranges = generate_date_ranges(config['start_date'], config['end_date'], config['frequency'])

    for start, end in date_ranges:
        try:
            search_filter = build_search_filter(start, end, config['aoi_polygon'], config['cloud_cover'])
            search_result = search_images(auth, search_filter)
            item_id, item_type = get_first_image_item(search_result)
            assets = get_item_assets(auth, item_id, item_type)
            activate_asset(auth, assets["ortho_analytic_4b"])
            download_url = wait_for_asset_activation(auth, f"https://api.planet.com/data/v1/item-types/{item_type}/items/{item_id}/assets")
            download_image(auth, download_url, item_id)

        except Exception as e:
            print(f"Error processing range {start} to {end}: {str(e)}")


if __name__ == "__main__":
    main()
