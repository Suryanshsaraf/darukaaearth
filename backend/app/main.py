from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.init_db import init_db
from app.db.session import SessionLocal, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup PostGIS extension and database tables if database is reachable
    try:
        with SessionLocal() as db:
            if not settings.DATABASE_URL.startswith("sqlite"):
                try:
                    db.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                    db.commit()
                except Exception:
                    pass

            Base.metadata.create_all(bind=engine)
            # Seed initial admin user and baseline projects
            init_db(db)
    except Exception:
        # Avoid crashing in test suites where SessionLocal is overridden
        pass

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint for Docker container and cloud load balancers."""
    return {
        "status": "healthy",
        "service": "darukaa-earth-api",
        "version": settings.VERSION,
    }


@app.get("/", tags=["System"])
def root():
    """Root redirect endpoint with API documentation links."""
    return {
        "message": "Welcome to Darukaa.Earth Geospatial Data Analytics Platform API",
        "docs": "/docs",
        "version": settings.VERSION,
        "api_v1": settings.API_V1_STR,
    }
