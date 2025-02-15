from fastapi import FastAPI, Response, Request, Header, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from json import dumps
from logging import getLogger, Formatter, StreamHandler
from time import time
import httpx
from os import environ
from sys import stdout
import jwt
from datetime import datetime, timedelta
from uuid import uuid4

# Just for demo
from fastapi.middleware.cors import CORSMiddleware
# Just for demo end

app = FastAPI(docs_url=None, redoc_url=None)

# Just for demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Just for demo end

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    PLANET_API_KEY: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ProjectRequest(BaseModel):
    farm_name: str
    aoi: List[List[float]]
    crop: str
    created_at: str
    seeding_date: str

class ImageRequest(BaseModel):
    start_date: str
    end_date: str

@app.post("/api/external/auth/signup", status_code=200)
async def signup(request: Request, signup_data: SignupRequest):
    try:
        logger = getLogger()
        data_manager_url = f"{environ['DATAMANAGER_URL']}/api/internal/data_manager/user/add"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(data_manager_url, json=signup_data.dict())
        
        if response.status_code == 200:
            logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User added successfully")
            return Response(content="User added successfully", status_code=200)
        elif response.status_code == 201:
            logger.info(f"201 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User already exist")
            return Response(content="User already exist", status_code=201)
        
        else:
            logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User was not added")
            return Response(content="User was not added", status_code=400)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Signup failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/external/auth/login", status_code=200)
async def login(request: Request, login_data: LoginRequest):
    try:
        logger = getLogger()
        data_manager_url = f"{environ['DATAMANAGER_URL']}/api/internal/data_manager/user/verify"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(data_manager_url, json=login_data.dict())
        
        if response.status_code == 200:
            user_data = response.json()
            token = generate_token(user_data['_id'])
            expires_in = 3600  # 60 minutes
            
            logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User logged in successfully")
            return Response(content=dumps({
                "user": user_data["_id"],
                "user_name": user_data["name"],
                "token": token,
                "expires_in": expires_in,
                "PLANET_API_KEY": user_data["PLANET_API_KEY"]
            }), status_code=200)
        else:
            logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - User does not exist")
            return Response(content="User does not exist", status_code=400)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Login failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.get("/api/external/projects", status_code=200)
async def get_projects(request: Request, authorization: str = Header(None)):
    try:
        logger = getLogger()
        verify_token(authorization, request.headers['user_id'])
        
        data_manager_url = f"{environ['DATAMANAGER_URL']}/api/internal/data_manager/project/get"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(data_manager_url, headers={"user_id": request.headers['user_id']})
        
        if response.status_code == 200:
            logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Projects retrieved successfully")
            return Response(content=response.content, status_code=200)
        else:
            logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Failed to retrieve projects")
            return Response(content="Failed to retrieve projects", status_code=400)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Get projects failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/external/projects", status_code=200)
async def add_project(request: Request, project_data: ProjectRequest, authorization: str = Header(None)):
    try:
        logger = getLogger()
        verify_token(authorization, request.headers['user_id'])
        
        data_manager_url = f"{environ['DATAMANAGER_URL']}/api/internal/data_manager/project/add"
        
        async with httpx.AsyncClient() as client:
            print(project_data)
            response = await client.post(data_manager_url, json=project_data.dict(), headers={"user_id": request.headers['user_id']})
        
        if response.status_code == 200:
            logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Project added successfully")
            return Response(content="Project added successfully", status_code=200)
        else:
            logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Failed to add project")
            return Response(content="Failed to add project", status_code=400)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Add project failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.post("/api/external/projects/{image_type}/image", status_code=200)
async def get_image(request: Request,  image_type: str, authorization: str = Header(None)):
    try:
        logger = getLogger()
        verify_token(authorization, request.headers['user_id'])
        
        data_manager_url = f"{environ['DATAMANAGER_URL']}/api/internal/data_manager/image/get"
        data = await request.json()
        config = {
            "image_id": data["date_of_interest"],
            "project_id": request.headers['project_id'],
            "user_id": request.headers['user_id'],
            "image_type": image_type
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(data_manager_url, json=config, headers={"user_id": request.headers['user_id']})
        
        if response.status_code == 200:
            logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Image retrieved successfully")
            return Response(content=response.content, status_code=200)
        else:
            logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Failed to retrieve image")
            return Response(content="Failed to retrieve image", status_code=400)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Get image failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)

@app.get("/api/external/projects/{project_id}/download_images/status", status_code=200)
async def get_status(request: Request,  project_id: str, authorization: str = Header(None)):
    try:
        logger = getLogger()
        verify_token(authorization, request.headers['user_id'])
        
        data_manager_url = f"{environ['DATAMANAGER_URL']}/api/internal/data_manager/project/status"

        async with httpx.AsyncClient() as client:
            response = await client.get(data_manager_url, headers={"user_id": request.headers['user_id'], 
                                                                             "project_id": project_id})
        if response.status_code == 200:
            logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - status retrieved successfully")
            return JSONResponse(status_code=200, content={"status": response.json()['status']})
        else:
            logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Failed to retrieve status")
            return Response(content="Failed to retrieve status", status_code=400)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Get status failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)


@app.post("/api/external/projects/{project_id}/download_images", status_code=200)
async def download_images(request: Request,  project_id: str, authorization: str = Header(None)):
    try:
        logger = getLogger()
        verify_token(authorization, request.headers['user_id'])
        data_manager_url = f"{environ['DATAMANAGER_URL']}/api/internal/data_manager/user/planet_key"
        async with httpx.AsyncClient() as client:
            response = await client.post(data_manager_url, json={'user_id': request.headers['user_id']})
        
        data_fetcher_url = f"{environ['DATAFETCHER_URL']}/api/internal/data_fetcher/download"
        data = await request.json()
        config = {
            "start_date": data["start_date"],
            "end_date": data["end_date"],
            "project_id": project_id,
            "aoi": data["aoi"],
            "user_id": request.headers['user_id'],
            "job_id": project_id,
            "PLANET_API_KEY": response.json()["PLANET_API_KEY"]
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(data_fetcher_url, json=config, headers={"user_id": request.headers['user_id']})

        response.raise_for_status()
        data_manager_url = f"{environ['DATAMANAGER_URL']}/api/internal/data_manager/project/status"

        async with httpx.AsyncClient() as client:
            response = await client.post(data_manager_url, json={"status": "running"}, headers={"user_id": request.headers['user_id'], 
                                                                             "project_id": project_id})
        
        if response.status_code == 200:
            logger.info(f"200 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Image retrieved successfully")
            return Response(content=response.content, status_code=200)
        else:
            logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Failed to retrieve image")
            return Response(content="Failed to retrieve image", status_code=400)
    except Exception as e:
        logger.error(f"400 {request.method} {request.url.path} {request.url.hostname} {request.headers['user-agent']} - Get image failed. {e.__class__.__name__}: {str(e)}")
        return Response(content=dumps({"error_code": 400, "error": f"{e.__class__.__name__}: {str(e)}"}), status_code=400)




def generate_token(user_id: str) -> str:
    expiration = datetime.utcnow() + timedelta(minutes=60)
    return jwt.encode({"user_id": user_id, "exp": expiration}, environ.get("JWT_SECRET"), algorithm="HS256")

def verify_token(token: str, user_id: str):
    try:
        payload = jwt.decode(token, environ.get("JWT_SECRET"), algorithms=["HS256"])
        if payload["user_id"] != user_id:
            raise HTTPException(status_code=401, detail="Invalid user")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

if __name__ == "__main__":
    logger = getLogger()
    formatter = Formatter(
        "[%(levelname)s %(asctime)s %(message)s]",
        datefmt='%d %b %Y, %H:%M:%S')
    
    stdout_handler = StreamHandler(stdout)
    stdout_handler.setFormatter(formatter)
    environ["JWT_SECRET"] = uuid4().__str__()
    
    if len(logger.handlers) == 0:
        logger.addHandler(stdout_handler)
    
    logger.setLevel(environ.get("LOG_LEVEL", "DEBUG"))
    
    uvicorn.run(app, host='0.0.0.0', port=5002, log_level="info", access_log=False)