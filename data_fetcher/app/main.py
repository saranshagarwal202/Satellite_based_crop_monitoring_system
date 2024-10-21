from fastapi import FastAPI, Response, Request
from pydantic import BaseModel
from typing import List
import uvicorn
from json import dumps
from logging import getLogger, Formatter, StreamHandler
from multiprocessing import Process, Manager
from time import time, sleep
from api_helper import run_downloader
from sys import stdout
from os import environ

app = FastAPI(docs_url=None, redoc_url=None)

# class DownloadRequest(BaseModel):
#     user_id: str
#     project_id: str
#     job_id: str
#     start_date: str
#     end_date: str
#     aoi: List[List[float]]
#     cloud_cover: float
#     PLANET_API_KEY: str
#     method: str

@app.post(path="/api/internal/data_fetcher/download", status_code = 200)
async def download_images(request: Request):
    try:
        logger = getLogger()
        config = await request.json()
        thread = Process(target=run_downloader, args=(config, app.running_processes))
        thread.start()
        app.running_processes[config['job_id']] = thread.pid
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Started download with job_id: {config['job_id']}")
        return Response(status_code=200, content="Started Successfully")
    except Exception as e:
        logger.error(
            f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

if __name__ == "__main__":
    logger = getLogger()

    formatter = Formatter(
    "[%(levelname)s %(asctime)s %(message)s]",
    datefmt='%d %b %Y, %H:%M:%S')
    
    # output_file_handler.setFormatter(formatter)
    stdout_handler = StreamHandler(stdout)
    stdout_handler.setFormatter(formatter)
    if len(logger.handlers)==0:
        logger.addHandler(stdout_handler)
    logger.setLevel(environ.get("LOG_LEVEL", "DEBUG"))

    multi_process_vars_manager = Manager()
    app.running_processes = multi_process_vars_manager.dict()

    uvicorn.run(app, host='0.0.0.0', port = 5000, log_level="info", access_log = False)