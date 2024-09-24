from requests import post
from queue import Queue, Empty
from time import sleep, time
from scene_downloading import download_scenes_to_queue
from threading import Thread
from cropping import cropping
from logging import getLogger

def send_to_data_manager(image, user_id):
    # add code wqhen data manager is ready
    return

def run_downloader(config: dict, check_thread: bool):
    try:
        st = time()
        eot_received = False # downloader will add 
        queue = Queue()
        logger = getLogger()

        thread = Thread(target=download_scenes_to_queue, args=(config["start_date"],
            config["end_date"],
            config["aoi"],
            config["cloud_cover"],
            queue),
            name=f"Download_scenes_{config["job_id"]}")
        thread.start()
        check_thread=True
        
        # Processing and sending images to data manager
        
        while eot_received:
            try:
                scene = queue.get_nowait()
                if time()-st>24*60*60:
                    raise TimeoutError(f"job_id: {config['job_id']} user_id: {config['user_id']} : Exiting thread after 24hrs run.")
            except Empty:
                sleep(30)
            
            cropped_image = cropping(tif_src=scene, AOI_points=config["aoi"])

            # Add a step for checking for cloud

            send_to_data_manager(cropped_image, config["user_id"])
        
        logger.info(f"Finished processing request for user:{config['user_id']}")
        return
    except Exception as e:
        logger.error(f"job_id: {config['job_id']} user_id: {config['user_id']} Error at run downloader \n {e.__class__.__name__}: {str(e)}")
        return
    




