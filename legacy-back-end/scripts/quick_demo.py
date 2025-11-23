#!/usr/bin/env python3
"""Quick demo of the Podcast Assistant API."""

import json
import requests

API_URL = "http://localhost:8000"

print("🎙️  Podcast Assistant - Quick Demo\n")
print("=" * 80)

# Step 1: Check health
print("\n1️⃣  Checking API health...")
health = requests.get(f"{API_URL}/health").json()
print(f"   Status: {health['status']}")
print(f"   Agent loaded: {health['agent_loaded']}")

# Step 2: Create session
print("\n2️⃣  Creating research session...")
session_data = {
    "guest_speaker": "Oliver Andreae",
    "guest_speaker_bio": "Software engineer at Goldman Sachs",
    "audience_description": "Computer science students at the University of Warwick",
}

response = requests.post(f"{API_URL}/sessions", json=session_data)
session = response.json()
session_id = session["session_id"]

print(f"   ✓ Session ID: {session_id}")
print(f"   Created at: {session['created_at']}")

# Step 3: Stream the response
print("\n3️⃣  Streaming agent research...\n")
print("=" * 80)

response = requests.get(f"{API_URL}/sessions/{session_id}/stream", stream=True)

for line in response.iter_lines():
    if not line:
        continue

    line = line.decode("utf-8")
    if line.startswith("data: "):
        event = json.loads(line[6:])

        if event.get("turn_complete"):
            print("\n" + "=" * 80)
            print("✓ Research complete!")
            break

        if "data" in event:
            print(event["data"], end="", flush=True)

print("\n\n🎉 Demo complete!")
print("\nTo open the web interface:")
print(f"   open file:///Users/oliver/Coding/agent-playground/back-end/test_client.html")
