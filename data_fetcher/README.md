
# Planet API Satellite Image Downloader

Download satellite images from the Planet API based on a date range, frequency, area of interest, and cloud cover. The script handles asset activation and downloads the images automatically.

## Prerequisites
- Planet API Key
- Package imports ([Dev Comment]: Refer to setup module's `requirements.txt`):
    - `requests`
    - `PyYAML`
    - `argparse`
    - `datetime`
    - `datetime`
    - `timedelta`
    - `enum`

## Configuration

Provide input via a YAML file:

### Example `config.yaml`
```yaml
start_date: "2023-09-01"
end_date: "2023-09-10"
frequency: "daily"  # Currently supported options: daily, weekly, monthly
aoi_polygon:
  - [-122.4194, 37.7749]
  - [-122.4194, 37.8049]
  - [-122.3894, 37.8049]
  - [-122.3894, 37.7749]
  - [-122.4194, 37.7749]
cloud_cover: 0.1  # Max cloud cover as decimal. Eg: (0.1 = 10%)
api_key: "planet_developer_api_key" # [Dev Comment]: This needs to be stored as an environment variable in the Docker container (Security reasons)
```

## Usage

Run the script with the configuration file:
```bash
python image_downloader.py --config config.yaml
```

The script will:
1. Search for images based on the config.
2. Activate the image asset.
3. Download the image as a `.tif` file.

Files are saved with the image item’s ID as the filename.

## Example

```bash
python image_downloader.py --config config.yaml
```

## Notes

- Polling for asset activation retries every 30 seconds. ([Dev Comment]: Time adaptation may be necessary in the future).
- Images are saved in the current directory with the item's ID as the filename.

## Troubleshooting

- **No images found**: Loosen the filters (date range, cloud cover, AOI).
- **Activation issues**: The asset may not be ready yet. The script will retry.
