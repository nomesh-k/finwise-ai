import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinWise AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./finwise.db"  # Defaults to SQLite locally if MySQL credentials are not provided
    )
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "finwise-ai-super-secure-production-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI / LLM Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Email & SMTP Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@finwise.ai")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "FinWise AI Security")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() in ("1", "true", "yes")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://finwise-ai-demo.vercel.app")
    
    # Automation & Multi-Agent Webhooks (e.g. n8n, Zapier)
    N8N_WEBHOOK_URL: str = os.getenv("N8N_WEBHOOK_URL", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
