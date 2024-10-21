from requests import post
from queue import Queue, Empty
from time import sleep, time
from scene_downloading import download_scenes_to_queue
from threading import Thread
from cropping import cropping
from logging import getLogger
from os import environ
import rasterio
from io import BytesIO

logger = getLogger()
datamanager_url = environ.get("DATAMANAGER_URL", "http://localhost:5001")

def send_to_data_manager(image: bytes, image_id: str, transform: tuple, user_id: str):
    try:
        config = {
            "image": image,
            "image_id": image_id,
            "user_id": user_id,
            "transform": transform,
        }
        post(f"{datamanager_url}/api/internal/add_tif")
    except Exception as e:
        logger.error(f"User_id: {user_id}. Error: Failed to send tif to data manager.")
    return

def run_downloader(config: dict, running_processes: dict):
    try:
        st = time()
        eot_received = False # downloader will add 
        queue = Queue()

        thread = Thread(target=download_scenes_to_queue, args=(
            config["job_id"],
            config["start_date"],
            config["end_date"],
            config["aoi"],
            config["cloud_cover"],
            queue,
            config["PLANET_API_KEY"]),
            name=f"Download_scenes_{config['job_id']}")
        thread.start()
        
        # Processing and sending images to data manager
        
        while eot_received:
            try:
                image_id, scene = queue.get_nowait()
                if isinstance(scene, str):
                    eot_received=False
                    continue
                if time()-st>24*60*60: # Maximum runtime of a thread will be 24 hrs. To stop zombie threads.
                    raise TimeoutError(f"job_id: {config['job_id']} user_id: {config['user_id']} : Exiting thread after 24hrs run.")
            except Empty:
                sleep(30)
                continue
            

            # Add a step for checking for cloud
            scene = rasterio.MemoryFile(scene)
            scene = rasterio.open(scene, mode='rb')
            cropped_image, transform = cropping(tif_src=scene, AOI_points=config["aoi"])

            # dumping cropped image
            profile = scene.profile
            profile.update(transform = transform,
                           width = cropped_image.shape[1],
                           height = cropped_image.shape[2]
                           )
            #debug this
            file = BytesIO()
            file = rasterio.MemoryFile(file)
            f = rasterio.open(file, 'wb', **profile)
            f.write(cropped_image.astype(rasterio.uint8))

            send_to_data_manager(f, config["user_id"])
        
        logger.info(f"Finished processing request for user:{config['user_id']}")
        del running_processes[config['job_id']] # So that app knows that process has ended
        return
    except Exception as e:
        logger.error(f"job_id: {config['job_id']} user_id: {config['user_id']} Error at run downloader \n {e.__class__.__name__}: {str(e)}")
        del running_processes[config['job_id']] # So that app knows that process has ended
        # send a signal to job_runner that process ended abruptly
        return
    




