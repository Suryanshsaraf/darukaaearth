from fastapi import APIRouter
from app.api.v1 import analytics, auth, projects, sites

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(sites.router)
api_router.include_router(analytics.router)
