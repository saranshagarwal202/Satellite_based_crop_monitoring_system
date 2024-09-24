from fastapi import FastAPI, Request, Response
import uvicorn
from json import dumps
from logging import getLogger
from threading import Thread
from time import time, sleep
from api_helper import run_downloader

app = FastAPI(docs_url=None, redoc_url=None)

@app.post(path="/api/internal/download", status_code = 200)
async def download_images(request: Request):
    try:
        logger = getLogger()
        config = await request.json()
        check_thread = True # To check if thread is executing properly
        thread = Thread(target=run_downloader, args=(config, check_thread))
        st_time = time()
        while check_thread and time()-st_time<=60:
            sleep(1)
        



        
        return Response(status_code=200, content="Started Successfully")
    except Exception as e:
        logger.error(
            f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

if __name__ == "__main__":

    uvicorn.run(app, host='0.0.0.0', port = 5000, log_level="info", access_log = False)