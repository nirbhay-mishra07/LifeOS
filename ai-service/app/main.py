from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.services.ai_service import generate_response


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="LifeOS AI Service",
    version="1.1.0",
    description="Gemini-powered conversational backend for LifeOS.",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        description="Message sent by the user.",
    )

    previous_interaction_id: str | None = Field(
        default=None,
        description=(
            "Gemini interaction ID belonging to the previous message "
            "in this chat."
        ),
    )


class ChatResponse(BaseModel):
    response: str
    interaction_id: str


# ---------------------------------------------------------
# Health / information endpoints
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "LifeOS AI Service is running",
        "version": "1.1.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "lifeos-ai",
    }


# ---------------------------------------------------------
# Chat endpoint
# ---------------------------------------------------------

@app.post(
    "/api/v1/chat",
    response_model=ChatResponse,
)
def chat(request: ChatRequest):

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    try:
        response, interaction_id = generate_response(
            message=message,
            previous_interaction_id=request.previous_interaction_id,
        )

        return ChatResponse(
            response=response,
            interaction_id=interaction_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(f"[LifeOS API] Unexpected error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Unexpected error in the LifeOS AI service.",
        ) from exc