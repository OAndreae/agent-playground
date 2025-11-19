# Back-End API

FastAPI application with type checking using mypy and **Google Agent Development Kit (ADK)** integration.

## What is Google ADK?

Google's Agent Development Kit (ADK) is a flexible, open-source framework for building, deploying, and orchestrating AI agents. It provides:

- **Code-first development**: Define agent logic directly in Python
- **Built-in streaming**: Server-Sent Events (SSE) support out of the box
- **Session management**: Automatic handling of user sessions
- **Model-agnostic**: Works with Gemini and other models
- **Production-ready**: Deploy anywhere (Cloud Run, Vertex AI, etc.)

## Setup

This project uses [uv](https://github.com/astral-sh/uv) as the package manager.

```bash
# Install dependencies
uv sync

# Set up environment variables
export GOOGLE_API_KEY="your-api-key-here"

# Run the application
uv run python main.py

# Or use uvicorn directly with hot reload
uv run uvicorn main:app --reload
```

## Type Checking

```bash
# Run mypy type checking
uv run mypy main.py agents/root_agent.py
```

## Endpoints

### Built-in Endpoints (provided by ADK)

- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation (Swagger UI)
- `POST /sessions` - Create a new agent session
- `GET /sessions` - List all sessions
- `GET /sessions/{session_id}` - Get session details
- `POST /run_sse` - **Streaming endpoint** - Run agent with Server-Sent Events

### Using the Streaming Endpoint

The `/run_sse` endpoint allows you to interact with the ADK agent in real-time using Server-Sent Events:

```bash
# Create a session first
curl -X POST http://localhost:8000/sessions

# Stream a message to the agent
curl -X POST http://localhost:8000/run_sse \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "message": "Hello!"
  }'
```

The agent will stream its response back in real-time using SSE format.

## Agent Definition

The Hello World agent is defined in `agents/root_agent.py`:

```python
from google.adk.agents.llm_agent import Agent

root_agent = Agent(
    model="gemini-2.0-flash-exp",
    name="hello_world_agent",
    description="A simple Hello World agent that greets users warmly.",
    instruction="You are a friendly Hello World agent..."
)
```

## Development

The application runs on `http://0.0.0.0:8000` by default.

Visit `http://localhost:8000/docs` for interactive API documentation.

## Requirements

- Python 3.11+
- Google API Key (get one at https://aistudio.google.com/app/apikey)
- `google-adk` package

## Learn More

- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [ADK Python Repository](https://github.com/google/adk-python)
- [ADK Samples](https://github.com/google/adk-samples)
