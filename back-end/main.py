"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Back-End API", version="0.1.0")


@app.get("/")
async def root() -> JSONResponse:
    """Root endpoint."""
    return JSONResponse({"message": "Hello from FastAPI!"})


@app.get("/health")
async def health() -> JSONResponse:
    """Health check endpoint."""
    return JSONResponse({"status": "healthy"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
