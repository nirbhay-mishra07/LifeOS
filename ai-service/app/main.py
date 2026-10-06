from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.ai_service import generate_response


app = FastAPI(
    title="LifeOS AI Service",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    previous_interaction_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    interaction_id: str


@app.get("/")
def root():
    return {
        "message": "LifeOS AI Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/v1/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    response, interaction_id = generate_response(
        message=request.message,
        previous_interaction_id=request.previous_interaction_id
    )

    return ChatResponse(
        response=response,
        interaction_id=interaction_id
    )
