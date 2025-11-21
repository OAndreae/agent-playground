"""FastAPI application entry point."""

import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator, Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import agent_router
from .routes.agent import set_session_manager
from .services.agent_service import AgentProtocol, SessionManager
from .agents.agent import podcast_researcher

# Load environment variables from .env file
load_dotenv()

# Debug: Print API key status (first few characters only for security)
api_key = os.getenv("GOOGLE_API_KEY", "")
print(
    f"Debug: GOOGLE_API_KEY loaded: {bool(api_key)} (starts with: {api_key[:10] if api_key else 'NOT SET'}...)"
)

# Global agent and session manager
agent: Optional[AgentProtocol] = None
session_manager: Optional[SessionManager] = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan manager for startup and shutdown events.

    Initializes the Google ADK agent and session manager on startup.
    """
    global agent, session_manager

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logger = logging.getLogger(__name__)
    logger.info("Application starting up...")

    # Load the Python-defined agent
    agent = podcast_researcher
    logger.info("Agent loaded successfully from Python module")

    # Initialize session manager
    session_manager = SessionManager(agent)
    set_session_manager(session_manager)
    logger.info("Session manager initialized")

    yield

    # Cleanup on shutdown
    logger.info("Shutting down...")


app = FastAPI(
    title="Fireside Chat Assistant API",
    version="0.1.0",
    description="API for podcast research agent powered by Google ADK",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agent_router)


@app.get("/")
async def root() -> JSONResponse:
    """Root endpoint."""
    return JSONResponse(
        {
            "message": "Fireside Chat Assistant API",
            "version": "0.1.0",
            "docs": "/docs",
        }
    )


@app.get("/health")
async def health() -> JSONResponse:
    """Health check endpoint."""
    return JSONResponse(
        {
            "status": "healthy",
            "agent_loaded": agent is not None,
            "session_manager_ready": session_manager is not None,
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
