# LifeOS

LifeOS combines a React + TypeScript service-guidance interface with a FastAPI backend that connects chat to Gemini. Chat history and Gemini interaction IDs are stored in the browser; chat messages are sent to Gemini through the backend.

## Frontend

Install dependencies and start Vite from the repository root:

```sh
npm install
npm run dev
```

The frontend uses `http://127.0.0.1:8000` as the AI API by default. To use another backend URL, set `VITE_API_BASE_URL` in a root `.env.local` file before starting Vite.

## AI backend

The backend requires Python 3.10 or newer and a Gemini API key. From the repository root:

```sh
cd ai-service
python -m venv .venv
```

Activate the environment (`.venv\Scripts\Activate.ps1` in PowerShell, or `source .venv/bin/activate` on macOS/Linux), then install dependencies and create the local environment file:

```sh
pip install -r requirements.txt
```

Copy `.env.example` to `.env` in `ai-service` (`Copy-Item .env.example .env` in PowerShell, or `cp .env.example .env` on macOS/Linux), then set `GEMINI_API_KEY` in `ai-service/.env`. Keep this key in the backend only; do not put it in a `VITE_` variable or commit the `.env` file. `LIFEOS_CORS_ORIGINS` can optionally hold a comma-separated list of allowed frontend origins.

Run the API from the `ai-service` directory:

```sh
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The health endpoint is available at `http://127.0.0.1:8000/health`. Start the frontend in a second terminal. Chat requests go to `POST /api/v1/chat`; service-guidance continuation remains in the existing LifeOS result and action-plan flow.
