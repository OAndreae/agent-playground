"""Agent API routes for session management and streaming."""

import json
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from ..models.dtos import (
    CreateSessionRequest,
    CreateSessionResponse,
    SendMessageRequest,
    ErrorResponse,
)
from ..services.agent_service import PartProtocol, SessionManager

router = APIRouter(prefix="/sessions", tags=["agent"])

# Global session manager instance (will be set by main.py)
session_manager: SessionManager | None = None


def set_session_manager(manager: SessionManager) -> None:
    """Set the global session manager instance.

    Args:
        manager: The SessionManager instance to use for all routes.
    """
    global session_manager
    session_manager = manager


@router.post(
    "",
    response_model=CreateSessionResponse,
    status_code=status.HTTP_201_CREATED,
    responses={500: {"model": ErrorResponse, "description": "Internal server error"}},
)
async def create_session(request: CreateSessionRequest) -> CreateSessionResponse:
    """Create a new agent session and start the research process.

    This endpoint creates a new session with the provided podcast guest information
    and immediately triggers the agent to begin researching and generating interview
    preparation materials.

    Args:
        request: Session creation request with guest speaker details.

    Returns:
        CreateSessionResponse with the new session_id and metadata.

    Raises:
        HTTPException: If session creation fails.
    """
    if session_manager is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session manager not initialized",
        )

    try:
        session_id, created_at = await session_manager.create_session(
            guest_speaker=request.guest_speaker,
            guest_speaker_bio=request.guest_speaker_bio,
            audience_description=request.audience_description,
        )

        return CreateSessionResponse(
            session_id=session_id,
            created_at=created_at,
            status="active",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}",
        )


@router.get(
    "/{session_id}/stream",
    responses={
        200: {
            "description": "Server-Sent Events stream of agent responses",
            "content": {"text/event-stream": {}},
        },
        404: {"model": ErrorResponse, "description": "Session not found"},
    },
)
async def stream_session(session_id: str) -> StreamingResponse:
    """Stream agent responses via Server-Sent Events (SSE).

    This endpoint provides a persistent connection that streams agent responses
    in real-time as the agent researches and generates content.

    Args:
        session_id: The unique session identifier.

    Returns:
        StreamingResponse with text/event-stream content type.

    Raises:
        HTTPException: If session not found or is inactive.
    """
    if session_manager is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session manager not initialized",
        )

    session_info = session_manager.get_session(session_id)
    if not session_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found or inactive",
        )

    async def event_generator() -> AsyncIterator[str]:
        """Generate SSE events from the agent's live events stream.

        Yields:
            SSE-formatted event strings.
        """
        try:
            async for event in session_info.live_events:
                # Handle turn completion signals
                if event.turn_complete or event.interrupted:
                    message = {
                        "turn_complete": event.turn_complete,
                        "interrupted": event.interrupted,
                    }
                    yield f"data: {json.dumps(message)}\n\n"
                    continue

                # Extract event content
                if not event.content or not event.content.parts:
                    continue

                part: PartProtocol = event.content.parts[0]
                if not part:
                    continue

                # Stream text responses
                if part.text and event.partial:
                    message = {
                        "mime_type": "text/plain",
                        "data": part.text,
                    }
                    yield f"data: {json.dumps(message)}\n\n"

                # Also send complete (non-partial) messages
                elif part.text and not event.partial:
                    message = {
                        "mime_type": "text/plain",
                        "data": part.text,
                        "complete": True,
                    }
                    yield f"data: {json.dumps(message)}\n\n"

        except Exception as e:
            error_message = {
                "error": "Stream error",
                "detail": str(e),
            }
            yield f"data: {json.dumps(error_message)}\n\n"
        finally:
            # Cleanup session when stream ends
            if session_manager:
                session_manager.close_session(session_id)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/{session_id}/message",
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": ErrorResponse, "description": "Session not found"},
    },
)
async def send_message(
    session_id: str,
    request: SendMessageRequest,
) -> dict[str, str]:
    """Send a follow-up message to an active agent session.

    This allows the user to send additional questions or instructions to the
    agent after the initial research has begun.

    Args:
        session_id: The unique session identifier.
        request: The message to send to the agent.

    Returns:
        Status confirmation.

    Raises:
        HTTPException: If session not found or message sending fails.
    """
    if session_manager is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session manager not initialized",
        )

    success = await session_manager.send_message(
        session_id=session_id,
        message=request.message,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found or inactive",
        )

    return {"status": "sent", "session_id": session_id}


@router.delete("/{session_id}")
async def close_session(session_id: str) -> dict[str, str]:
    """Close an active session and cleanup resources.

    Args:
        session_id: The unique session identifier.

    Returns:
        Status confirmation.

    Raises:
        HTTPException: If session not found.
    """
    if session_manager is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session manager not initialized",
        )

    success = session_manager.close_session(session_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found",
        )

    return {"status": "closed", "session_id": session_id}


@router.get("/stats")
async def get_stats() -> dict[str, int]:
    """Get statistics about active sessions.

    Returns:
        Dictionary with session statistics.
    """
    if session_manager is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session manager not initialized",
        )

    return {
        "active_sessions": session_manager.get_active_session_count(),
    }
