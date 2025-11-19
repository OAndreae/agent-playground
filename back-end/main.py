"""FastAPI application entry point."""

import asyncio
import os
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from google import genai

app = FastAPI(title="Back-End API", version="0.1.0")

# Initialize Google GenAI client
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY", ""))


@app.get("/")
async def root() -> JSONResponse:
    """Root endpoint."""
    return JSONResponse({"message": "Hello from FastAPI!"})


@app.get("/health")
async def health() -> JSONResponse:
    """Health check endpoint."""
    return JSONResponse({"status": "healthy"})


async def stream_hello_world() -> AsyncIterator[str]:
    """Stream Hello World message using Google GenAI."""
    try:
        # Create a simple streaming response with Google GenAI
        response = client.models.generate_content_stream(
            model="gemini-2.0-flash-exp",
            contents="Say 'Hello, World!' and explain what you are in one sentence.",
        )

        # Stream the response chunks
        for chunk in response:
            if chunk.text:
                yield f"data: {chunk.text}\n\n"
                await asyncio.sleep(0)  # Allow other tasks to run

    except Exception as e:
        yield f"data: Error: {str(e)}\n\n"


@app.get("/stream")
async def stream() -> StreamingResponse:
    """Streaming Hello World endpoint using Google GenAI."""
    return StreamingResponse(
        stream_hello_world(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
