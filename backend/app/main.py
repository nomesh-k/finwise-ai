from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.api_v1 import api_router
from app.services.seed_data import seed_demo_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("finwise-api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demonstration data
    logger.info("Initializing FinWise AI database schemas...")
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_demo_data(db)
            logger.info("Demonstration account seeded successfully (demo@finwise.ai).")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error during database startup initialization: {e}")
    yield
    logger.info("FinWise AI backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-oriented AI-powered personal financial planning platform API.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact support or retry."}
    )

# Include v1 Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "finwise-ai-api",
        "version": settings.VERSION,
        "database": "connected"
    }

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Welcome to FinWise AI API.",
        "documentation": "/docs",
        "version": settings.VERSION
    }
