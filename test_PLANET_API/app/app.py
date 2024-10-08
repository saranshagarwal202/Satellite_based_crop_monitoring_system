from fastapi import FastAPI, Request, Response
import uvicorn
from json import dumps, loads
from logging import getLogger

app = FastAPI(docs_url=None, redoc_url=None)

@app.post(path="/data/v1/quick-search", status_code = 200)
async def quick_search(request: Request):
    try:
        logger = getLogger()
        config = await request.json()
        f = open("app/quick-search-response.json", 'r')
        response_data = loads(f.read())
        f.close()
        
        return Response(status_code=200, content=dumps(response_data))
    except Exception as e:
        logger.error(
            f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)
    
@app.get(path="/data/v1/item-types/PSScene/items/{image_id}/assets/", status_code = 200)
async def assets(request: Request, image_id):
    try:
        logger = getLogger()
        # config = await request.json()
        f = open("app/assets-response-active.json", 'r')
        response_data = loads(f.read())
        f.close()
        response_data['ortho_visual']['_links']['activate'] = 'http://test_planet_api:4999/data/v1/assets/eyJpIjogIjIwMjMwNTE3XzE2MTIxOV8yNV8yNDMwIiwgImMiOiAiUFNTY2VuZSIsICJ0IjogIm9ydGhvX3Zpc3VhbCIsICJjdCI6ICJpdGVtLXR5cGUifQ/activate'
        response_data['ortho_visual']['location'] = 'http://test_planet_api:4999/data/v1/download?token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbWN4ekNTUmRSem01UERZMWxvSUZFY010bjR5LXVUdVBCSVd5N2dad2pYT3gtVVR4RHluc2hMVENNVmJHMTdUQ1EwXzA0Mnhjb1RGQmkwU2FfYnJBZz09IiwiZXhwIjoxNzI4MDAxMDMxLCJ0b2tlbl90eXBlIjoidHlwZWQtaXRlbSIsIml0ZW1fdHlwZV9pZCI6IlBTU2NlbmUiLCJpdGVtX2lkIjoiMjAyMzA1MTdfMTYxMjE5XzI1XzI0MzAiLCJhc3NldF90eXBlIjoib3J0aG9fdmlzdWFsIn0.sqe0hcBqTKSdU-9Zna39Wpo4emuu8vnJaWE4gTS0RElDKOR9H73lb0SX5IjGZB1PiIcTFgyqiaTobGUPa14kJQ'
        
        return Response(status_code=200, content=dumps(response_data))
    except Exception as e:
        logger.error(
            f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)
    
@app.get(path="/data/v1/assets/{image_id}/activate", status_code = 200)
async def assets(request: Request, image_id):
    try:
        logger = getLogger()
        # config = await request.json()
        
        return Response(status_code=202)
    except Exception as e:
        logger.error(
            f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)
    
@app.get(path="/data/v1/download", status_code = 200)
async def assets(request: Request, token: str):
    try:
        logger = getLogger()
        # config = await request.json()
        f = open("app/asset-download-content.txt", 'rb')
        response_data = f.read()
        f.close()
        
        return Response(status_code=202, content=response_data)
    except Exception as e:
        logger.error(
            f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port = 4999, log_level="info", access_log = False)