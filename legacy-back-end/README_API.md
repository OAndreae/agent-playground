# Podcast Assistant API

A FastAPI service that serves a Google ADK agent for podcast research. The agent researches guest speakers and generates interview preparation materials.

## Quick Start

### 1. Start the Server

```bash
cd /Users/oliver/Coding/agent-playground/back-end
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 2. Check API Documentation

Open in your browser:
- Interactive Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

---

## Usage Examples

### Method 1: Quick Python Demo

```bash
uv run python quick_demo.py
```

This runs a simple end-to-end demonstration.

### Method 2: Full Python Client

```bash
uv run python test_client.py
```

This demonstrates:
- Creating a session
- Streaming responses in real-time
- Sending follow-up questions
- Session management

### Method 3: Web Browser Interface

Open `test_client.html` in your browser:

```bash
open test_client.html
```

Features:
- Form-based session creation
- Real-time streaming display
- Follow-up question input
- Clean, interactive UI

### Method 4: cURL Commands

#### Create a Session

```bash
curl -X POST http://localhost:8000/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "guest_speaker": "Dr. Emily Chen",
    "guest_speaker_bio": "Quantum computing researcher at Stanford University",
    "audience_description": "Tech professionals interested in quantum computing"
  }'
```

Response:
```json
{
  "session_id": "abc-123-def-456",
  "created_at": "2025-11-20T00:00:00.000000",
  "status": "active"
}
```

#### Stream the Response

```bash
curl -N http://localhost:8000/sessions/SESSION_ID/stream
```

Output (Server-Sent Events):
```
data: {"mime_type": "text/plain", "data": "Okay, I'm ready to research..."}

data: {"mime_type": "text/plain", "data": "# Dr. Emily Chen\n\n## Bio\n..."}

data: {"turn_complete": true, "interrupted": null}
```

#### Send Follow-up Message

```bash
curl -X POST http://localhost:8000/sessions/SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you suggest 3 more questions about quantum algorithms?"
  }'
```

#### Close Session

```bash
curl -X DELETE http://localhost:8000/sessions/SESSION_ID
```

---

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sessions` | Create new research session |
| `GET` | `/sessions/{id}/stream` | Stream agent responses (SSE) |
| `POST` | `/sessions/{id}/message` | Send follow-up message |
| `DELETE` | `/sessions/{id}` | Close and cleanup session |
| `GET` | `/sessions/stats` | Get session statistics |
| `GET` | `/health` | Health check |
| `GET` | `/` | API info |

### Request/Response Formats

#### Create Session Request

```json
{
  "guest_speaker": "Dr. Jane Smith",
  "guest_speaker_bio": "AI researcher at MIT",
  "audience_description": "Software engineers interested in AI"
}
```

#### Create Session Response

```json
{
  "session_id": "f8029b3a-09e8-44ec-a40b-852a5bdd05ee",
  "created_at": "2025-11-20T00:18:12.120533",
  "status": "active"
}
```

#### Stream Event Format (SSE)

Text chunks:
```
data: {"mime_type": "text/plain", "data": "Some text..."}
```

Turn completion:
```
data: {"turn_complete": true, "interrupted": null}
```

Errors:
```
data: {"error": "Error message", "detail": "Additional details"}
```

---

## JavaScript/TypeScript Usage

### Using EventSource (Browser)

```javascript
// Create session
const response = await fetch('http://localhost:8000/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guest_speaker: "Dr. Emily Chen",
    guest_speaker_bio: "Quantum computing researcher",
    audience_description: "Tech professionals"
  })
});

const { session_id } = await response.json();

// Stream responses
const eventSource = new EventSource(
  `http://localhost:8000/sessions/${session_id}/stream`
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.turn_complete) {
    console.log('Agent finished!');
    eventSource.close();
    return;
  }

  if (data.data) {
    console.log(data.data);
  }
};

eventSource.onerror = (error) => {
  console.error('Connection error:', error);
  eventSource.close();
};
```

### Using fetch with streaming (Node.js/Modern browsers)

```javascript
const response = await fetch(
  `http://localhost:8000/sessions/${session_id}/stream`
);

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));
      if (event.data) {
        process.stdout.write(event.data);
      }
    }
  }
}
```

---

## Python Usage

### Using requests library

```python
import json
import requests

# Create session
response = requests.post(
    "http://localhost:8000/sessions",
    json={
        "guest_speaker": "Dr. Emily Chen",
        "guest_speaker_bio": "Quantum computing researcher",
        "audience_description": "Tech professionals"
    }
)
session_id = response.json()["session_id"]

# Stream responses
response = requests.get(
    f"http://localhost:8000/sessions/{session_id}/stream",
    stream=True
)

for line in response.iter_lines():
    if line and line.startswith(b"data: "):
        event = json.loads(line[6:])

        if event.get("turn_complete"):
            break

        if "data" in event:
            print(event["data"], end="", flush=True)
```

### Using httpx (async)

```python
import json
import httpx

async def stream_research():
    async with httpx.AsyncClient() as client:
        # Create session
        response = await client.post(
            "http://localhost:8000/sessions",
            json={"guest_speaker": "Dr. Emily Chen", ...}
        )
        session_id = response.json()["session_id"]

        # Stream responses
        async with client.stream(
            "GET",
            f"http://localhost:8000/sessions/{session_id}/stream"
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    event = json.loads(line[6:])
                    if event.get("data"):
                        print(event["data"], end="", flush=True)
```

---

## Configuration

### Environment Variables

Set these in your `.env` file:

```bash
# Required
GOOGLE_API_KEY=your_api_key_here
GOOGLE_CSE_ID=your_custom_search_engine_id

# Optional
GOOGLE_GENAI_USE_VERTEXAI=0
```

### Agent Configuration

The agent is configured in Python:
```
src/agents/agent.py
```

Key settings:
- **Model**: `gemini-2.0-flash-exp` (supports streaming)
- **Tools**: `google_search` (requires `GOOGLE_CSE_ID`)
- **Parameters**: `GUEST_SPEAKER`, `GUEST_SPEAKER_BIO`, `AUDIENCE_DESCRIPTION`

---

## Troubleshooting

### Agent not loaded

Check health endpoint:
```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "agent_loaded": true,
  "session_manager_ready": true
}
```

### Model not supported error

Ensure the YAML uses a streaming-compatible model:
- ✅ `gemini-2.0-flash-exp`
- ❌ `gemini-2.5-flash` (not supported for bidiGenerateContent)
- ❌ `gemini-1.5-flash` (not supported for bidiGenerateContent)

### CORS errors (from browser)

The API has CORS enabled with `allow_origins=["*"]` for development. In production, restrict this to specific domains in `src/main.py`.

### Session not found

Sessions are stored in-memory and will be lost on server restart. Also, sessions are automatically closed when the stream ends.

---

## Architecture

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Python)   │
└──────┬──────┘
       │
       │ HTTP/SSE
       │
┌──────▼──────────────────────────────────┐
│         FastAPI Server                  │
│  ┌─────────────────────────────────┐   │
│  │  Routes (agent.py)              │   │
│  │  - POST /sessions               │   │
│  │  - GET /sessions/{id}/stream    │   │
│  │  - POST /sessions/{id}/message  │   │
│  └─────────────┬───────────────────┘   │
│                │                        │
│  ┌─────────────▼───────────────────┐   │
│  │  SessionManager                 │   │
│  │  - Create/manage sessions       │   │
│  │  - Template substitution        │   │
│  │  - LiveRequestQueue handling    │   │
│  └─────────────┬───────────────────┘   │
└────────────────┼────────────────────────┘
                 │
                 │
┌────────────────▼────────────────────────┐
│      Google ADK Agent                   │
│  ┌──────────────────────────────────┐  │
│  │  LlmAgent (from YAML)            │  │
│  │  - Model: gemini-2.0-flash-exp   │  │
│  │  - Tools: google_search          │  │
│  │  - Instruction with parameters   │  │
│  └──────────────┬───────────────────┘  │
└─────────────────┼──────────────────────┘
                  │
                  │
         ┌────────▼────────┐
         │  Google Gemini  │
         │  + Search API   │
         └─────────────────┘
```

---

## Development

### Run with auto-reload

```bash
uv run uvicorn src.main:app --reload
```

### Run tests

```bash
uv run pytest
```

### Type checking

```bash
uv run mypy src/
```

### Format code

```bash
uv run ruff format
```

---

## Production Deployment

1. **Set environment variables** securely
2. **Restrict CORS origins** in `src/main.py`
3. **Use production WSGI server** (e.g., Gunicorn + Uvicorn workers)
4. **Add authentication** if needed
5. **Consider session persistence** (Redis, database)
6. **Add rate limiting**
7. **Monitor sessions** to prevent memory leaks

Example production command:
```bash
gunicorn src.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

---

## License

MIT
