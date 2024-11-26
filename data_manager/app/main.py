from fastapi import FastAPI, Request, Response, Header
from fastapi.responses import JSONResponse
import uvicorn
from json import dumps, loads
from logging import getLogger
from sftp_communications import save_tif, save_png, load_png
from pymongo import MongoClient
from datetime import datetime
from os import environ
from bson import ObjectId
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from io import BytesIO

client = MongoClient(f"mongodb://{environ['MONGO_DB_USERNAME']}:{environ['MONGO_DB_PASSWORD']}@{environ['MONGO_DB_URL']}:{environ['MONGO_DB_PORT']}/")
db = client['metadata_store']

app = FastAPI(docs_url=None, redoc_url=None)
logger = getLogger()

@app.on_event("startup")
async def startup_event():
    if "users" not in db.list_collection_names():
        db.create_collection("users")
        logger.info("users found")
    if "projects" not in db.list_collection_names():
        db.create_collection("projects")
        logger.info("projects found")
    # print("HERE")

@app.post("/api/internal/data_manager/add_tif", status_code=200)
async def add_tiff(request: Request):
    try:
        image = await request.body()
        save_tif(image, request.headers["image_id"], request.headers["user_id"], request.headers["project_id"])
        
        # Add code to update the project document
        db.projects.update_one(
            {"_id": ObjectId(request.headers["project_id"])},
            {"$push": {"images": request.headers["image_id"], "ndvi": float(request.headers["ndvi"]), "gci": float(request.headers["gci"])}}
        )
        project = db.projects.find_one({"_id": ObjectId(request.headers["project_id"])})

        # create NDVI and GCI plot over time
        for img_type in ["ndvi", "gci"]:
            images = [datetime.strptime(i[:8], "%Y%m%d") for i in project['images']]
            fig, ax = plt.subplots()
            ax.plot(images, project[img_type])
            ax.scatter(images, project[img_type])
            date_format = mdates.DateFormatter('%Y-%m-%d')
            ax.xaxis.set_major_formatter(date_format)
            plt.xticks(rotation=45)
            ax.grid()
            ax.set_title(f"{str.upper(img_type)} over time")
            ax.set_xlabel("Date")
            ax.set_ylabel(str.upper(img_type))
            figfile = BytesIO()
            plt.savefig(figfile, format='png', bbox_inches='tight')
            figfile.seek(0)
            save_png(figfile.read(), img_type, img_type, request.headers["user_id"], request.headers["project_id"])
            logger.info(f"Saved {img_type}")
        
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Added image: {request.headers['image_id']}")
        
        return Response(status_code=200, content="Added Successfully")
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/internal/data_manager/add_png", status_code=200)
async def add_png(request: Request):
    try:
        image = await request.body()
        save_png(image, request.headers["image_type"],  request.headers["image_id"], request.headers["user_id"], request.headers["project_id"])
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Added image: {request.headers['image_id']}")

        return Response(status_code=200, content="Added Successfully")
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/internal/data_manager/user/add", status_code=200)
async def add_user(request: Request):
    try:
        user_data = await request.json()
        already_exist = db.users.find_one({"email": user_data["email"]})
        if bool(already_exist):
            logger.info(f"201 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User already exist: {user_data['email']}")
            return Response(status_code=201, content="User already exist")
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
            return JSONResponse(status_code=200, content={"_id": str(user["_id"]), "email": user["email"], "name": user["name"], "PLANET_API_KEY": user["PLANET_API_KEY"]})
        else:
            return Response(status_code=404, content="User not found")
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User verification failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/internal/data_manager/user/planet_key", status_code=200)
async def verify_user(request: Request):
    try:
        user_data = await request.json()
        user = db.users.find_one({"_id": ObjectId(user_data["user_id"])})
        if user:
            return JSONResponse(status_code=200, content={"_id": str(user["_id"]), "email": user["email"], "name": user["name"], "PLANET_API_KEY": user["PLANET_API_KEY"]})
        else:
            return Response(status_code=404, content="User not found")
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User verification failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)


@app.get("/api/internal/data_manager/project/get", status_code=200)
async def get_projects(request: Request):
    try:
        user = db.users.find_one({"_id": ObjectId(request.headers['user_id'])})
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
            "created_at": project_data["created_at"],
            "seeding_date": project_data["seeding_date"],
            "user_id": user_id,
            "images": [],
            "ndvi": [],
            "gci": [],
            "status": "finished"
        }
        
        already_exist = db.projects.find_one({"user_id": user_id, "farm_name": project_data["farm_name"]})
        if bool(already_exist):
            logger.info(f"201 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Project already exist: {project_data['farm_name']}")
            return Response(status_code=201, content="Project already exist")
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

@app.post("/api/internal/data_manager/project/status", status_code=200)
async def modify_status(request: Request):
    try:
        data = await request.json()
        user_id = request.headers.get("user_id")
        
        db.projects.update_one(
            {"_id": ObjectId(request.headers["project_id"])},
            {"$set": {"status": data["status"]}}
        )
        
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Status Modified")
        return Response(content="Status modified", status_code=200)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Project addition failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.get("/api/internal/data_manager/project/status", status_code=200)
async def retrive_status(request: Request):
    try:
        user_id = request.headers.get("user_id")
        
        status = db.projects.find_one({"_id": ObjectId(request.headers['project_id'])})['status']
        
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Status Retrival")
        return JSONResponse(status_code=200, content={"status": status})
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Status retrival failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)


@app.post("/api/internal/data_manager/image/get", status_code=200)
async def get_image(request: Request):
    try:
        config = await request.json()
        if config["image_type"] in ["ndvi", "gci"]:
            config["image_id"] = config["image_type"]

        image = load_png(config['image_type'], config["image_id"], config["user_id"], config["project_id"])
        
        logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Image Loaded: {config['image_id']}")
        
        return Response(status_code=200, content=image)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Chat response failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=5001, log_level="info", access_log=False)