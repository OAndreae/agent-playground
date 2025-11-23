# Postman Guide - Podcast Assistant API

## Quick Setup

### Import the Collection

1. **Open Postman**
2. Click **Import** (top left)
3. Select **File** tab
4. Choose `Fireside_Chat_Assistant.postman_collection.json`
5. Click **Import**

You'll now have a collection with all endpoints ready to use!

---

## Step-by-Step Usage

### Step 1: Health Check

**Request:**
```
GET http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "agent_loaded": true,
  "session_manager_ready": true
}
```

✅ If `agent_loaded` is `true`, you're ready to proceed!

---

### Step 2: Create a Session

**Request:**
```
POST http://localhost:8000/sessions
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "guest_speaker": "Dr. Emily Chen",
  "guest_speaker_bio": "Quantum computing researcher at Stanford University, pioneering work in quantum algorithms and error correction",
  "audience_description": "Tech professionals and software engineers interested in quantum computing"
}
```

**Expected Response (201 Created):**
```json
{
  "session_id": "f8029b3a-09e8-44ec-a40b-852a5bdd05ee",
  "created_at": "2025-11-20T00:18:12.120533",
  "status": "active"
}
```

📝 **Copy the `session_id`** - you'll need it for the next steps!

**In Postman:**
- The collection includes a script that automatically saves `session_id` to a collection variable
- You can see it in the collection variables tab

---

### Step 3: View Streaming Response

⚠️ **Important Note About Streaming in Postman:**

Postman doesn't fully support Server-Sent Events (SSE) streaming. You'll see the complete response, but not in real-time.

**Request:**
```
GET http://localhost:8000/sessions/{{session_id}}/stream
```

**What You'll See:**

Raw SSE format:
```
data: {"mime_type": "text/plain", "data": "Okay, I'm ready to research..."}

data: {"mime_type": "text/plain", "data": "# Dr. Emily Chen\n\n## Bio\n..."}

data: {"turn_complete": true, "interrupted": null}
```

**To see real-time streaming, use one of these instead:**

#### Option A: cURL (Terminal)
```bash
curl -N http://localhost:8000/sessions/YOUR_SESSION_ID/stream
```

#### Option B: Python Client
```bash
uv run python quick_demo.py
```

#### Option C: Web Interface
```bash
open test_client.html
```

---

### Step 4: Send a Follow-up Message

**Request:**
```
POST http://localhost:8000/sessions/{{session_id}}/message
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "message": "Can you suggest 3 additional questions about quantum error correction?"
}
```

**Expected Response (200 OK):**
```json
{
  "status": "sent",
  "session_id": "f8029b3a-09e8-44ec-a40b-852a5bdd05ee"
}
```

After sending, you need to **stream again** (Step 3) to see the agent's response.

---

### Step 5: Check Session Stats

**Request:**
```
GET http://localhost:8000/sessions/stats
```

**Expected Response:**
```json
{
  "active_sessions": 1
}
```

---

### Step 6: Close Session (Optional)

Sessions are automatically closed when streaming ends, but you can manually close them:

**Request:**
```
DELETE http://localhost:8000/sessions/{{session_id}}
```

**Expected Response (200 OK):**
```json
{
  "status": "closed",
  "session_id": "f8029b3a-09e8-44ec-a40b-852a5bdd05ee"
}
```

---

## Complete Example Workflow in Postman

### Example 1: Research a Tech CEO

```json
POST /sessions
{
  "guest_speaker": "Satya Nadella",
  "guest_speaker_bio": "CEO of Microsoft, transformed the company through cloud computing and AI",
  "audience_description": "Business leaders and tech executives"
}
```

### Example 2: Research an Author

```json
POST /sessions
{
  "guest_speaker": "Cal Newport",
  "guest_speaker_bio": "Computer science professor and author of Deep Work and Digital Minimalism",
  "audience_description": "Knowledge workers and productivity enthusiasts"
}
```

### Example 3: Research a Scientist

```json
POST /sessions
{
  "guest_speaker": "Dr. Jennifer Doudna",
  "guest_speaker_bio": "Nobel Prize winner for CRISPR gene editing technology",
  "audience_description": "Scientists, researchers, and biotech professionals"
}
```

---

## Postman Tips

### Using Collection Variables

The collection automatically saves `session_id` as a variable. You can reference it with:
```
{{session_id}}
```

To manually set it:
1. Click on the collection
2. Go to **Variables** tab
3. Update the `session_id` value

### Testing Tab

The "Create Session" request includes a test script that automatically saves the session ID:

```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set('session_id', response.session_id);
    console.log('Session ID saved:', response.session_id);
}
```

You can view the console output in **View → Show Postman Console**

### Environments

You can create different environments for different deployments:

**Development:**
- `base_url`: `http://localhost:8000`

**Production:**
- `base_url`: `https://api.yourcompany.com`

---

## Troubleshooting

### "Cannot connect" error

Make sure the server is running:
```bash
cd /Users/oliver/Coding/agent-playground/back-end
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### "Session not found" error

Sessions are stored in-memory and lost on server restart. Create a new session.

### "Agent not loaded" in health check

Check the server logs. The agent YAML may have errors.

### Streaming doesn't work

Postman doesn't support real-time SSE. Use cURL, Python client, or the web interface instead.

---

## Alternative: Using Postman's CLI (Newman)

For automated testing:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Fireside_Chat_Assistant.postman_collection.json \
  --environment your-environment.json

# With reporters
newman run Fireside_Chat_Assistant.postman_collection.json \
  --reporters cli,json
```

---

## API Documentation Links

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

The Swagger UI provides an interactive interface where you can test all endpoints directly in your browser!

---

## Advanced Postman Features

### Pre-request Scripts

Add this to automatically check health before each request:

```javascript
pm.sendRequest({
    url: pm.collectionVariables.get('base_url') + '/health',
    method: 'GET'
}, (err, response) => {
    if (err || !response.json().agent_loaded) {
        console.error('API not healthy!');
    }
});
```

### Dynamic Variables

Postman provides built-in variables:

```json
{
  "guest_speaker": "Dr. {{$randomFirstName}} {{$randomLastName}}",
  "created_at": "{{$timestamp}}"
}
```

### Monitors

Set up Postman Monitors to run health checks automatically:

1. Click the collection
2. Select **Monitors** tab
3. Click **Create Monitor**
4. Schedule regular health checks

---

## Need Help?

- Check the API docs: http://localhost:8000/docs
- Run the Python demo: `uv run python quick_demo.py`
- Open the web interface: `open test_client.html`
- Read the full API guide: `README_API.md`
