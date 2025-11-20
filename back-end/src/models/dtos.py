"""Data Transfer Objects for the API."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CreateSessionRequest(BaseModel):
    """Request to create a new agent session."""

    guest_speaker: str = Field(
        ...,
        description="Name of the podcast guest speaker",
        min_length=1,
    )
    guest_speaker_bio: str = Field(
        ...,
        description="Biography or background information about the guest speaker",
        min_length=1,
    )
    audience_description: str = Field(
        ...,
        description="Description of the podcast audience to tailor questions",
        min_length=1,
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "guest_speaker": "Dr. Jane Smith",
                    "guest_speaker_bio": "AI researcher and professor at MIT, specializing in natural language processing",
                    "audience_description": "Software engineers and AI enthusiasts interested in practical applications of NLP",
                }
            ]
        }
    }


class CreateSessionResponse(BaseModel):
    """Response when a session is successfully created."""

    session_id: str = Field(..., description="Unique identifier for the session")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the session was created",
    )
    status: str = Field(
        default="active",
        description="Current status of the session",
    )


class SendMessageRequest(BaseModel):
    """Request to send a message to an active agent session."""

    message: str = Field(
        ...,
        description="The message content to send to the agent",
        min_length=1,
    )
    mime_type: str = Field(
        default="text/plain",
        description="MIME type of the message content",
    )


class StreamEvent(BaseModel):
    """Event streamed from the agent via Server-Sent Events."""

    mime_type: str = Field(
        default="text/plain",
        description="MIME type of the event data",
    )
    data: str = Field(..., description="The actual content of the event")
    turn_complete: Optional[bool] = Field(
        default=None,
        description="Indicates if the agent has completed its turn",
    )
    interrupted: Optional[bool] = Field(
        default=None,
        description="Indicates if the agent was interrupted",
    )


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(
        default=None,
        description="Additional details about the error",
    )
    status_code: int = Field(..., description="HTTP status code")
