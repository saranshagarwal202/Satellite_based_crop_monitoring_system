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
from datetime import datetime
import matplotlib.pyplot as plt
import joblib
import pandas as pd

model = joblib.load("random_forest_model.joblib")

logger = getLogger()
datamanager_url = environ.get("DATAMANAGER_URL", "http://localhost:5001")

def send_to_data_manager(image: bytes, png_image: bytes, ndvi_img, gci_img, yield_img, ndvi, gci,  cloud_cover_ratio: float, transform: tuple, image_id: str, user_id: str, project_id: str):
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
                        headers={"image_type": "sat", "user_id": config["user_id"], "project_id": config["project_id"], "image_id": config["image_id"]})
        response.raise_for_status()

        response = post(f"{datamanager_url}/api/internal/data_manager/add_png", 
                        data=ndvi_img,
                        headers={"image_type": "sat_ndvi", "user_id": config["user_id"], "project_id": config["project_id"], "image_id": config["image_id"]})
        response.raise_for_status()

        response = post(f"{datamanager_url}/api/internal/data_manager/add_png", 
                        data=gci_img,
                        headers={"image_type": "sat_gci", "user_id": config["user_id"], "project_id": config["project_id"], "image_id": config["image_id"]})
        response.raise_for_status()

        response = post(f"{datamanager_url}/api/internal/data_manager/add_png", 
                        data=yield_img,
                        headers={"image_type": "yield", "user_id": config["user_id"], "project_id": config["project_id"], "image_id": config["image_id"]})
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

            png_image = Image.fromarray(cropped_image[:3,:,:].transpose(1,2,0))

            # calculate ndvi and gci
            inf_cropped_image = cropped_image
            inf_cropped_image = inf_cropped_image.astype(np.float32)
            inf_cropped_image[inf_cropped_image==0] = -np.inf

            ndvi_arr = (inf_cropped_image[3,:,:]-inf_cropped_image[0,:,:])/(inf_cropped_image[3,:,:]+inf_cropped_image[0,:,:])
            gci_arr = (inf_cropped_image[3,:,:]/inf_cropped_image[1,:,:])-1

            ndvi_arr = np.nan_to_num(ndvi_arr)
            gci_arr = np.nan_to_num(gci_arr)


            ndvi = np.mean(ndvi_arr)
            gci = np.mean(gci_arr)

            byte_io = BytesIO()
            # Save the image to the BytesIO object
            png_image.save(byte_io, format="PNG")
            byte_io.seek(0)

            # create heatmap for ndvi and gci
            ndvi_img = BytesIO()
            plt.figure()
            plt.imshow(ndvi_arr, cmap= "viridis")
            plt.colorbar(label="NDVI", shrink=0.5)
            plt.axis('off')
            plt.title('NDVI')
            plt.savefig(ndvi_img, format='png', bbox_inches='tight')
            ndvi_img.seek(0)

            gci_img = BytesIO()
            plt.figure()
            plt.imshow(gci_arr, cmap= "viridis")
            plt.colorbar(label="GCI", shrink=0.5)
            plt.axis('off')
            plt.title('GCI')
            plt.savefig(gci_img, format='png', bbox_inches='tight')
            gci_img.seek(0)

            # calculating yield
            ## <ToDo> hardcoding N-days from seeding for presentation
            n_days_from_seeding = 40
            n_days_from_seeding = [n_days_from_seeding for j in range(ndvi_arr.shape[0])]
            yield_ = np.zeros(ndvi_arr.shape)
            # Create a feature array
            for i in range(ndvi_arr.shape[-1]):
                # features = np.column_stack((temp_arr, ndvi, gci))
                feature_names = ['n_days_from_seeding', 'ndvi', 'gci']
                features_df = pd.DataFrame({'n_days_from_seeding': n_days_from_seeding,'ndvi': ndvi_arr[:,i],'gci': gci_arr[:,i]})
                # Generate predictions
                yield_[:,i] = model.predict(features_df)
            yield_ = np.clip(yield_, 0, 40)
            yield_img = BytesIO()
            plt.figure()
            plt.imshow(yield_, cmap= "viridis")
            plt.colorbar(label="Yield", shrink=0.5)
            plt.axis('off')
            plt.title('Yield (in kgs)')
            plt.savefig(yield_img, format='png', bbox_inches='tight')
            yield_img.seek(0)



            # checking cloud info
            passed, cloud_cover_ratio = check_for_clouds(cropped_image, ratio=config.get('cloud_cover', 0.1))

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
            send_to_data_manager(file.read(), byte_io.read(), ndvi_img.read(), gci_img.read(), yield_img.read(), ndvi, gci, cloud_cover_ratio, transform, image_id, config["user_id"], config["project_id"])
        
        logger.info(f"Finished processing request for user:{config['user_id']}")

        # send status to data manager
        response = post(f"{datamanager_url}/api/internal/data_manager/project/status", 
                        json={"status": "finished"},
                        headers={"user_id": config["user_id"], "project_id": config["project_id"]})
                        # headers={'user_id': user_id, 'project_id': project_id, 'image_id': image_id})
        response.raise_for_status()

        del running_processes[config['job_id']] # So that app knows that process has ended
        return
    except Exception as e:
        logger.error(f"job_id: {config['job_id']} user_id: {config['user_id']} Error at run downloader {e.__class__.__name__}: {str(e)}")
        del running_processes[config['job_id']] # So that app knows that process has ended
        # send a signal to job_runner that process ended abruptly
        return
    




