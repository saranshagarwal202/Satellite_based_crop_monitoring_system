import argparse
import rasterio
from time import sleep, time
from threading import Thread
from queue import Queue, Empty
from logging import getLogger
from json import loads
import os
from app.scene_downloading import download_scenes_to_queue
from app.cropping import cropping
from app.cloud_check import check_for_clouds

def run_downloader(config: dict, output_dir: str):
    try:
        st = time()
        eot_received = True # downloader will add 
        queue = Queue()
        logger = getLogger()

        thread = Thread(target=download_scenes_to_queue, args=(config["start_date"],
            config["end_date"],
            config["aoi"],
            config["cloud_cover"],
            queue,
            config["PLANET_API_KEY"]),
            name=f"Download_scenes_{config['job_id']}")
        thread.start()
        
        # Processing and sending images to data manager
        i = 0
        while eot_received:
            try:
                image_id, scene = queue.get_nowait()
                if isinstance(scene, str):
                    eot_received=False
                    continue
                if time()-st>24*60*60:
                    raise TimeoutError(f"job_id: {config['job_id']} user_id: {config['user_id']} : Exiting thread after 24hrs run.")
            except Empty:
                sleep(30)
                continue
            scene = rasterio.MemoryFile(scene)
            scene = rasterio.open(scene, mode='rb')
            cropped_imag, transform = cropping(tif_src=scene, AOI_points=config["aoi"])
            

            # Add a step for checking for cloud
            # cloud_check = check_for_clouds(cropped_imag)
            # if not cloud_check:
            #     logger.info(f"{config['user_id']} Not including cloudy image for image id {image_id}")
            #     continue

            # dumping cropped image
            profile = scene.profile
            profile.update(transform = transform,
                           width = cropped_imag.shape[1],
                           height = cropped_imag.shape[2]
                           )
            with rasterio.open(os.path.join(output_dir, f"{image_id}_cropped.tif"), 'w', **profile) as f:
                f.write(cropped_imag.astype(rasterio.uint8))
            i+=1

        logger.info(f"Finished processing request for user:{config['user_id']}")
        return
    except Exception as e:
        logger.error(f"job_id: {config['job_id']} user_id: {config['user_id']} Error at run downloader \n {e.__class__.__name__}: {str(e)}")
        return
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output_dir", type=str, required=True, help="Enter the directory where output tif will be stored.")
    parser.add_argument("--input_aoi_json", type=str, required=True, help="path of the json file where aoi is stored.")
    parser.add_argument("--start_date", type=str, required=True, help = "enter date string in the format YYYY-MM-DD")
    parser.add_argument("--end_date", type=str, required=True, help = "enter date string in the format YYYY-MM-DD")
    parser.add_argument("--API_KEY", type=str, required=False, help = "enter API_KEY for accessing planet api data.")
    parser.add_argument("--cloud_cover_range", type=tuple, required=False, help = "enter cloud cover range for Scene. Eg: (0.1, 0.5)",
                        default=(0.1, 0.5))
    args = parser.parse_args()

    with open(args.input_aoi_json, 'r') as f:
        aoi_polygon = loads(f.read())
    
    if bool(args.API_KEY):
        assert isinstance(args.API_KEY, str)
        api_key = args.API_KEY
        
    else:
        assert isinstance(os.environ.get("PLANET_API_KEY"), str)
        api_key = os.environ.get("PLANET_API_KEY")
    
    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)
    
    config = {
        "job_id": os.P_PID,
        "user_id": "local user",
        "start_date": args.start_date,
        "end_date": args.end_date,
        "aoi": aoi_polygon,
        "cloud_cover": args.cloud_cover_range,
        "PLANET_API_KEY": api_key
    }

    run_downloader(config, args.output_dir)
