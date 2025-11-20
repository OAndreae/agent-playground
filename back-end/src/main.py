"""FastAPI application entry point."""

import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import agent_router
from .routes.agent import set_session_manager
from .services.agent_service import SessionManager, load_agent


# Global agent and session manager
agent = None
session_manager = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events.

    Initializes the Google ADK agent and session manager on startup.
    """
    global agent, session_manager

    # Get the agent YAML path
    agent_path = os.getenv(
        "AGENT_YAML_PATH",
        str(
            Path(__file__).parent
            / "agents"
            / "fireside_chat_assistant"
            / "tmp"
            / "fireside_chat_assistant"
            / "root_agent.yaml"
        ),
    )

    print(f"Loading agent from: {agent_path}")

    # Load the agent
    agent = load_agent(agent_path)
    print("Agent loaded successfully")

    # Initialize session manager
    session_manager = SessionManager(agent)
    set_session_manager(session_manager)
    print("Session manager initialized")

    yield

    # Cleanup on shutdown
    print("Shutting down...")


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
