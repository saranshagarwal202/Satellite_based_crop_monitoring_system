from fastapi import FastAPI, Request, Response
import uvicorn
from json import dumps
from logging import getLogger
from sftp_communications import save_tif
from pymongo import MongoClient
from datetime import datetime
from os import environ

client = MongoClient(f"mongodb://{environ['MONGO_DB_USERNAME']}:{environ['MONGO_DB_PASSWORD']}@{environ['MONGO_DB_URL']}:{environ['MONGO_DB_PORT']}/")

db = client['metadata_store']
app = FastAPI(docs_url=None, redoc_url=None)

@app.post(path="/api/internal/data_manager/add_tif", status_code = 200)
async def download_images(request: Request):
    """Tif images sent by data_fetcher to be saved in sftp"""
    try:
        logger = getLogger()
        image = await request.body()

        # Add to sftp
        save_tif(image, request.headers["image_id"], request.headers["user_id"], request.headers["project_id"])


        # Add metadata in mongo 
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Added image: {request.headers['image_id']}")
        return Response(status_code=200, content="Added Successfully")
    except Exception as e:
        logger.error(
            f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

if __name__ == "__main__":

    # add test_user


    uvicorn.run(app, host='0.0.0.0', port = 5001, log_level="info", access_log = False)