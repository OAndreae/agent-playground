# Back-End API

FastAPI application with type checking using mypy.

## Setup

This project uses [uv](https://github.com/astral-sh/uv) as the package manager.

```bash
# Install dependencies
uv sync

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

## Development

The application runs on `http://0.0.0.0:8000` by default.
