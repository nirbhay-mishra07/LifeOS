import os
from pathlib import Path

from dotenv import load_dotenv


SERVICE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(SERVICE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Add it to ai-service/.env before starting the backend."
    )

DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("LIFEOS_CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]
