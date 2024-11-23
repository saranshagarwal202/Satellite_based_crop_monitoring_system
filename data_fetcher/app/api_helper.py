from requests import post
from queue import Queue, Empty
from time import sleep, time
from scene_downloading import download_scenes_to_queue
from cloud_check import check_for_clouds
from threading import Thread
from cropping import cropping
from logging import getLogger
from os import environ
import rasterio
from io import BytesIO
from PIL import Image
import numpy as np

logger = getLogger()
datamanager_url = environ.get("DATAMANAGER_URL", "http://localhost:5001")

def send_to_data_manager(image: bytes, png_image: bytes, ndvi, gci,  cloud_cover_ratio: float, transform: tuple, image_id: str, user_id: str, project_id: str):
    try:
        config = {
            # "image": image,
            "image_id": image_id,
            "user_id": user_id,
            "project_id": project_id,
            'transform_x_coord': str(transform[0]),
            'transform_y_coord': str(transform[3]),
            'transform_x_meter': str(transform[1]),
            'transform_y_meter': str(transform[5]),
            'transform_x_rotation': str(transform[4]),
            'transform_y_rotation': str(transform[2]),
            "cloud_cover_ratio": str(cloud_cover_ratio),
            "ndvi": str(float(ndvi)),
            "gci": str(float(gci))
        }
        response = post(f"{datamanager_url}/api/internal/data_manager/add_tif", 
                        data=image,
                        headers=config)
                        # headers={'user_id': user_id, 'project_id': project_id, 'image_id': image_id})
        response.raise_for_status()

        response = post(f"{datamanager_url}/api/internal/data_manager/add_png", 
                        data=png_image,
                        headers=config)
        response.raise_for_status()
    except Exception as e:
        logger.error(f"User_id: {user_id} image_id: {image_id} - Error: Failed to send tif to data manager. {e.__class__.__name__}: {str(e)}")
    return

def run_downloader(config: dict, running_processes: dict):
    try:
        st = time()
        eot_received = True # downloader will add 
        queue = Queue()

        thread = Thread(target=download_scenes_to_queue, args=(
            config["job_id"],
            config["start_date"],
            config["end_date"],
            config["aoi"],
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
            scene = rasterio.open(scene, mode='r')
            cropped_image, transform = cropping(tif_src=scene, AOI_points=config["aoi"])

            png_image = Image.fromarray(cropped_image[:,:,:3])

            # calculate ndvi and gci
            inf_cropped_image = cropped_image
            inf_cropped_image[inf_cropped_image==0] = -np.inf
            ndvi = np.mean((inf_cropped_image[:,:,3]-inf_cropped_image[:,:,2])/(inf_cropped_image[:,:,3]+inf_cropped_image[:,:,2]))
            gci = np.mean((inf_cropped_image[:,:,3]/inf_cropped_image[:,:,1])-1)

            byte_io = BytesIO()
            # Save the image to the BytesIO object
            png_image.save(byte_io, format="PNG")

            # checking cloud info
            passed, cloud_cover_ratio = check_for_clouds(cropped_image, ratio=config['cloud_cover'])

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
            f.close()
            # image: bytes, cloud_cover_ratio: float, transform: tuple, image_id: str, user_id: str, project_id: str
            send_to_data_manager(file.read(), byte_io, ndvi, gci, cloud_cover_ratio, transform, image_id, config["user_id"], config["project_id"])
        
        logger.info(f"Finished processing request for user:{config['user_id']}")
        del running_processes[config['job_id']] # So that app knows that process has ended
        return
    except Exception as e:
        logger.error(f"job_id: {config['job_id']} user_id: {config['user_id']} Error at run downloader {e.__class__.__name__}: {str(e)}")
        del running_processes[config['job_id']] # So that app knows that process has ended
        # send a signal to job_runner that process ended abruptly
        return
    




