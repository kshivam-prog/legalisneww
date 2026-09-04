"""
Configuration settings for AI Agreement Analyzer
"""

import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings"""
    
    # App
    APP_NAME = "AI Agreement Analyzer"
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", "8000"))
    
    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///./agreement_analyzer.db"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
    
    # File Upload
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
    
    # LLM Configuration
    LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "mistralai/Mistral-7B-Instruct-v0.1")
    LLM_DEVICE = os.getenv("LLM_DEVICE", "cpu")  # "cuda" for GPU
    LLM_CACHE_DIR = os.getenv("LLM_CACHE_DIR", "./models")
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "512"))
    
    # Document Processing
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
    
    # Request timeout
    REQUEST_TIMEOUT = 300  # 5 minutes
    
    class Config:
        env_file = ".env"


settings = Settings()

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
