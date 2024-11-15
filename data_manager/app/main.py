from fastapi import FastAPI, Request, Response, Header
from fastapi.responses import JSONResponse
import uvicorn
from json import dumps, loads
from logging import getLogger
from sftp_communications import save_tif
from pymongo import MongoClient
from datetime import datetime
from os import environ
from bson import ObjectId

client = MongoClient(f"mongodb://{environ['MONGO_DB_USERNAME']}:{environ['MONGO_DB_PASSWORD']}@{environ['MONGO_DB_URL']}:{environ['MONGO_DB_PORT']}/")
db = client['metadata_store']

app = FastAPI(docs_url=None, redoc_url=None)
logger = getLogger()

@app.on_event("startup")
async def startup_event():
    if "users" not in db.list_collection_names():
        db.create_collection("users")
    if "projects" not in db.list_collection_names():
        db.create_collection("projects")

@app.post("/api/internal/data_manager/add_tif", status_code=200)
async def download_images(request: Request):
    try:
        image = await request.body()
        save_tif(image, request.headers["image_id"], request.headers["user_id"], request.headers["project_id"])
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Added image: {request.headers['image_id']}")
        return Response(status_code=200, content="Added Successfully")
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/internal/data_manager/user/add", status_code=200)
async def add_user(request: Request):
    try:
        user_data = await request.json()
        result = db.users.insert_one({
            "email": user_data["email"],
            "password": user_data["password"],
            "name": user_data["name"],
            "PLANET_API_KEY": user_data["PLANET_API_KEY"],
            "projects_id": []
        })
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Added user: {user_data['email']}")
        return Response(status_code=200, content="User Added Successfully")
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User addition failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/internal/data_manager/user/verify", status_code=200)
async def verify_user(request: Request):
    try:
        user_data = await request.json()
        user = db.users.find_one({"email": user_data["email"], "password": user_data["password"]})
        if user:
            return JSONResponse(status_code=200, content={"_id": str(user["_id"]), "email": user["email"], "name": user["name"]})
        else:
            return Response(status_code=404, content="User not found")
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User verification failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.get("/api/internal/data_manager/project/get", status_code=200)
async def get_projects(user_id: str = Header(None)):
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            project_ids = user.get("projects_id", [])
            projects = list(db.projects.find({"_id": {"$in": project_ids}}))
            for project in projects:
                project["_id"] = str(project["_id"])
            return JSONResponse(status_code=200, content=projects)
        else:
            return Response(status_code=404, content="User not found")
    except Exception as e:
        logger.error(f"400 GET /api/internal/data_manager/project/get - Project retrieval failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/internal/data_manager/project/add", status_code=200)
async def add_project(request: Request):
    try:
        project_data = await request.json()
        user_id = request.headers.get("user_id")
        
        project = {
            "farm_name": project_data["farm_name"],
            "aoi": project_data["aoi"],
            "crop": project_data["crop"],
            "created_at": project_data["created_at"]
        }
        
        result = db.projects.insert_one(project)
        project_id = result.inserted_id
        
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"projects_id": project_id}}
        )
        
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Added project: {project_id}")
        return JSONResponse(status_code=200, content={"project_id": str(project_id)})
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Project addition failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=5001, log_level="info", access_log=False)