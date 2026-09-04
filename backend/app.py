"""
AI Agreement Analyzer - FastAPI Backend
Analyzes legal agreements using local LLM (Mistral/Llama) without requiring external API keys
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from config import settings
from database import engine, Base, get_db
from routes import agreements, health
import models  # Import to register models with SQLAlchemy

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("Starting AI Agreement Analyzer...")
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized")
    yield
    logger.info("Shutting down AI Agreement Analyzer...")


app = FastAPI(
    title="AI Agreement Analyzer",
    description="Analyze legal agreements using local LLM without external API keys",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(agreements.router, prefix="/api", tags=["agreements"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Agreement Analyzer API",
        "docs": "/docs",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
