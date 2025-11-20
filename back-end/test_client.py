#!/usr/bin/env python3
"""
Test client for the Fireside Chat Assistant API.
Demonstrates end-to-end usage of creating sessions and streaming responses.
"""

import json
import requests
from typing import Iterator


API_BASE_URL = "http://localhost:8000"


def create_session(
    guest_speaker: str,
    guest_speaker_bio: str,
    audience_description: str,
) -> str:
    """Create a new agent session.

    Args:
        guest_speaker: Name of the podcast guest.
        guest_speaker_bio: Biography of the guest.
        audience_description: Target audience description.

    Returns:
        Session ID string.
    """
    response = requests.post(
        f"{API_BASE_URL}/sessions",
        json={
            "guest_speaker": guest_speaker,
            "guest_speaker_bio": guest_speaker_bio,
            "audience_description": audience_description,
        },
    )
    response.raise_for_status()
    data = response.json()

    print(f"✓ Session created: {data['session_id']}")
    print(f"  Created at: {data['created_at']}")
    print(f"  Status: {data['status']}\n")

    return data["session_id"]


def stream_session(session_id: str) -> Iterator[dict]:
    """Stream responses from an agent session.

    Args:
        session_id: The session identifier.

    Yields:
        Parsed event dictionaries.
    """
    print(f"📡 Streaming session {session_id}...\n")
    print("=" * 80)

    response = requests.get(
        f"{API_BASE_URL}/sessions/{session_id}/stream",
        stream=True,
    )
    response.raise_for_status()

    full_response = ""

    for line in response.iter_lines():
        if not line:
            continue

        line = line.decode("utf-8")

        if line.startswith("data: "):
            data = json.loads(line[6:])  # Skip "data: " prefix

            # Handle turn completion
            if data.get("turn_complete"):
                print("\n" + "=" * 80)
                print("✓ Agent completed response")
                yield data
                break

            # Handle errors
            if "error" in data:
                print(f"\n❌ Error: {data['error']}")
                if "detail" in data:
                    print(f"   Detail: {data['detail']}")
                yield data
                break

            # Handle text data
            if "data" in data:
                text = data["data"]

                # Print incrementally (streaming effect)
                print(text, end="", flush=True)
                full_response += text

                yield data

    print("\n" + "=" * 80)
    print(f"\n📄 Full response received ({len(full_response)} characters)\n")


def send_message(session_id: str, message: str) -> bool:
    """Send a follow-up message to an active session.

    Args:
        session_id: The session identifier.
        message: The message to send.

    Returns:
        True if successful.
    """
    response = requests.post(
        f"{API_BASE_URL}/sessions/{session_id}/message",
        json={"message": message},
    )
    response.raise_for_status()

    data = response.json()
    print(f"✓ Message sent: {data['status']}\n")

    return data["status"] == "sent"


def close_session(session_id: str) -> bool:
    """Close an active session.

    Args:
        session_id: The session identifier.

    Returns:
        True if successful.
    """
    response = requests.delete(f"{API_BASE_URL}/sessions/{session_id}")
    response.raise_for_status()

    data = response.json()
    print(f"✓ Session closed: {data['status']}")

    return data["status"] == "closed"


def check_health() -> dict:
    """Check API health status.

    Returns:
        Health status dictionary.
    """
    response = requests.get(f"{API_BASE_URL}/health")
    response.raise_for_status()

    return response.json()


def main():
    """Main test flow."""
    print("🎙️  Fireside Chat Assistant - Test Client\n")

    # Check health
    print("Checking API health...")
    health = check_health()
    print(f"  Status: {health['status']}")
    print(f"  Agent loaded: {health['agent_loaded']}")
    print(f"  Session manager ready: {health['session_manager_ready']}\n")

    if not health["agent_loaded"]:
        print("❌ Agent not loaded. Exiting.")
        return

    # Create session
    print("Creating new session...")
    session_id = create_session(
        guest_speaker="Dr. Emily Chen",
        guest_speaker_bio=(
            "Quantum computing researcher at Stanford University, "
            "pioneering work in quantum algorithms and error correction"
        ),
        audience_description=(
            "Tech professionals and software engineers interested in "
            "quantum computing and its practical applications"
        ),
    )

    # Stream the initial response
    try:
        for event in stream_session(session_id):
            # You can process events here if needed
            pass
    except KeyboardInterrupt:
        print("\n\n⚠️  Streaming interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during streaming: {e}")

    # Optional: Send a follow-up question
    print("\n📨 Sending follow-up question...")
    send_message(
        session_id,
        "Can you suggest 3 additional questions about quantum error correction?",
    )

    # Stream the follow-up response
    print("\n📡 Streaming follow-up response...\n")
    try:
        for event in stream_session(session_id):
            pass
    except KeyboardInterrupt:
        print("\n\n⚠️  Streaming interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during streaming: {e}")

    # Note: Session will be automatically closed when stream ends
    # But you can also manually close it:
    # close_session(session_id)


if __name__ == "__main__":
    main()
