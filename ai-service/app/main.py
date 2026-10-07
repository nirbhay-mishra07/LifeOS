from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import CORS_ORIGINS
from app.services.ai_service import generate_response


app = FastAPI(
    title="LifeOS AI Service",
    version="1.1.0",
    description="Gemini-powered conversational backend for LifeOS.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=12000)
    previous_interaction_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    interaction_id: str


@app.get("/")
def root():
    return {"message": "LifeOS AI Service is running", "version": "1.1.0"}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "lifeos-ai"}


@app.post("/api/v1/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        response, interaction_id = generate_response(
            message=message,
            previous_interaction_id=request.previous_interaction_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(response=response, interaction_id=interaction_id)
