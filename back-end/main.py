"""FastAPI application entry point with Google ADK integration."""

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from google.adk.cli.fast_api import get_fast_api_app


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan events."""
    # Startup
    print("🚀 Back-End API with Google ADK is starting up...")
    yield
    # Shutdown
    print("👋 Back-End API is shutting down...")


# Initialize FastAPI app with Google ADK integration
# This provides built-in endpoints for:
# - /sessions - Session management
# - /run_sse - Agent streaming endpoint (Server-Sent Events)
app = get_fast_api_app(
    agents_dir="agents",  # Directory containing agent definitions
    web=False,  # Disable ADK's built-in web UI (we're creating our own API)
    lifespan=lifespan,
)


@app.get("/")
async def root() -> JSONResponse:
    """Root endpoint."""
    return JSONResponse(
        {
            "message": "Hello from FastAPI with Google ADK!",
            "endpoints": {
                "health": "/health",
                "sessions": "/sessions",
                "agent_stream": "/run_sse",
                "docs": "/docs",
            },
        }
    )


@app.get("/health")
async def health() -> JSONResponse:
    """Health check endpoint."""
    return JSONResponse({"status": "healthy", "adk_enabled": True})


if __name__ == "__main__":
    import uvicorn

    # Get API key from environment
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print(
            "⚠️  Warning: GOOGLE_API_KEY environment variable not set. "
            "The agent may not function properly."
        )

    uvicorn.run(app, host="0.0.0.0", port=8000)
