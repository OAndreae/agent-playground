# Back-End API

FastAPI application with type checking using mypy and Google Agent Development Kit integration.

## Setup

This project uses [uv](https://github.com/astral-sh/uv) as the package manager.

```bash
# Install dependencies
uv sync

# Set up environment variables
export GOOGLE_API_KEY="your-api-key-here"

# Run the application
uv run python main.py

# Or use uvicorn directly
uv run uvicorn main:app --reload
```

## Type Checking

```bash
# Run mypy type checking
uv run mypy main.py
```

## Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check endpoint
- `GET /stream` - Streaming Hello World endpoint using Google GenAI (Server-Sent Events)

## Development

The application runs on `http://0.0.0.0:8000` by default.

## Requirements

- Python 3.11+
- Google API Key (for streaming endpoint)
