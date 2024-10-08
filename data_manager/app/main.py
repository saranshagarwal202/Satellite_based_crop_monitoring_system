from fastapi import FastAPI, Request, Response
import uvicorn
from json import dumps
from logging import getLogger
from sftp_communications import save_tif

app = FastAPI(docs_url=None, redoc_url=None)

@app.post(path="/api/internal/data_manager/add_tif", status_code = 200)
async def download_images(request: Request):
    """Tif images sent by data_fetcher to be saved in sftp"""
    try:
        logger = getLogger()
        config = await request.json()

        # Add to sftp
        save_tif(config["image"], config["image_id"], config["user_id"], config["farm_id"])

        return Response(status_code=200, content="Added Successfully")
    except Exception as e:
        logger.error(
            f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

if __name__ == "__main__":

    uvicorn.run(app, host='0.0.0.0', port = 5001, log_level="info", access_log = False)