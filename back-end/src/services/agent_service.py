"""Agent service for managing Google ADK agent sessions."""

import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import AsyncIterator, Dict, Optional, Protocol, cast

from google.adk.agents import config_agent_utils
from google.adk.runners import InMemoryRunner  # pyright: ignore[reportAttributeAccessIssue]
from google.adk.runners import RunConfig  # pyright: ignore[reportAttributeAccessIssue,reportPrivateImportUsage]
from google.adk.runners import LiveRequestQueue  # pyright: ignore[reportAttributeAccessIssue,reportPrivateImportUsage]
from google.genai.types import Content, Part

from ..tools import google_search_tool


class AgentProtocol(Protocol):
    """Protocol for Google ADK Agent objects."""

    instruction: str
    tools: list[object]


class SessionProtocol(Protocol):
    """Protocol for Google ADK Session objects."""

    pass


class LiveRequestQueueProtocol(Protocol):
    """Protocol for Google ADK LiveRequestQueue objects."""

    def send_content(self, content: Content) -> None:
        """Send content to the queue."""
        ...

    def close(self) -> None:
        """Close the queue."""
        ...


class PartProtocol(Protocol):
    """Protocol for Part objects in event content."""

    text: str | None


class ContentProtocol(Protocol):
    """Protocol for Content objects in events."""

    parts: list[PartProtocol]


class LiveEvent(Protocol):
    """Protocol for live event objects from the agent."""

    turn_complete: bool | None
    interrupted: bool | None
    partial: bool | None
    content: ContentProtocol | None


class SessionInfo:
    """Container for active session information."""

    def __init__(
        self,
        session_id: str,
        runner: InMemoryRunner,
        session: SessionProtocol,
        live_request_queue: LiveRequestQueueProtocol,
        live_events: AsyncIterator[LiveEvent],
        created_at: datetime,
    ) -> None:
        self.session_id = session_id
        self.runner = runner
        self.session = session
        self.live_request_queue = live_request_queue
        self.live_events = live_events
        self.created_at = created_at
        self.is_active = True


class SessionManager:
    """Manages agent sessions and their lifecycle."""

    def __init__(self, agent: AgentProtocol) -> None:
        """Initialize the session manager with a loaded agent.

        Args:
            agent: The Google ADK agent instance loaded from YAML.
        """
        self.agent = agent
        self.sessions: Dict[str, SessionInfo] = {}

    def _create_agent_with_parameters(
        self,
        guest_speaker: str,
        guest_speaker_bio: str,
        audience_description: str,
    ) -> AgentProtocol:
        """Create a copy of the agent with template parameters substituted.

        Args:
            guest_speaker: Guest speaker name.
            guest_speaker_bio: Guest speaker biography.
            audience_description: Target audience description.

        Returns:
            Agent instance with substituted instruction.
        """
        import copy

        # Create a deep copy of the agent
        agent_copy: AgentProtocol = copy.copy(self.agent)

        # Get the original instruction
        original_instruction = self.agent.instruction

        # Substitute the template placeholders
        substituted_instruction = (
            original_instruction.replace("{GUEST_SPEAKER}", guest_speaker)
            .replace("{GUEST_SPEAKER_BIO}", guest_speaker_bio)
            .replace("{AUDIENCE_DESCRIPTION}", audience_description)
        )

        # Set the new instruction
        agent_copy.instruction = substituted_instruction

        # Register the custom Google Search tool
        # Replace the YAML-referenced google_search with our custom implementation
        agent_copy.tools = [google_search_tool]

        return agent_copy

    async def create_session(
        self,
        guest_speaker: str,
        guest_speaker_bio: str,
        audience_description: str,
    ) -> tuple[str, datetime]:
        """Create a new agent session with the provided parameters.

        Args:
            guest_speaker: Name of the podcast guest.
            guest_speaker_bio: Biography of the guest.
            audience_description: Description of the target audience.

        Returns:
            Tuple of (session_id, created_at timestamp).
        """
        session_id = str(uuid.uuid4())
        created_at = datetime.now(UTC)

        # Create a copy of the agent with substituted parameters
        # The agent's instruction contains placeholders that need to be replaced
        agent_copy = self._create_agent_with_parameters(
            guest_speaker=guest_speaker,
            guest_speaker_bio=guest_speaker_bio,
            audience_description=audience_description,
        )

        # Create InMemoryRunner for this session with the parameterized agent
        runner = InMemoryRunner(  # pyright: ignore[reportArgumentType]
            app_name="podcast_researcher",
            agent=agent_copy,  # pyright: ignore[reportArgumentType]
        )

        # Create a session
        session = cast(
            SessionProtocol,
            await runner.session_service.create_session(
                app_name="podcast_researcher",
                user_id=session_id,
            ),
        )

        # Configure the agent run
        run_config = RunConfig(response_modalities=["TEXT"])

        # Create live request queue
        live_request_queue = cast(LiveRequestQueueProtocol, LiveRequestQueue())

        # Start the agent with live streaming
        live_events = cast(
            AsyncIterator[LiveEvent],
            runner.run_live(  # pyright: ignore[reportArgumentType]
                session=session,  # pyright: ignore[reportArgumentType]
                live_request_queue=live_request_queue,  # pyright: ignore[reportArgumentType]
                run_config=run_config,
            ),
        )

        # Store session info
        session_info = SessionInfo(
            session_id=session_id,
            runner=runner,
            session=session,
            live_request_queue=live_request_queue,
            live_events=live_events,
            created_at=created_at,
        )
        self.sessions[session_id] = session_info

        # Send initial message to trigger the agent
        initial_message = (
            "Please begin your research and create the interview prep report."
        )
        content = Content(role="user", parts=[Part.from_text(text=initial_message)])
        live_request_queue.send_content(content=content)

        return session_id, created_at

    def get_session(self, session_id: str) -> Optional[SessionInfo]:
        """Retrieve an active session by ID.

        Args:
            session_id: The unique session identifier.

        Returns:
            SessionInfo if found and active, None otherwise.
        """
        session_info = self.sessions.get(session_id)
        if session_info and session_info.is_active:
            return session_info
        return None

    async def send_message(self, session_id: str, message: str) -> bool:
        """Send a message to an active session.

        Args:
            session_id: The session identifier.
            message: The message text to send.

        Returns:
            True if message was sent successfully, False otherwise.
        """
        session_info = self.get_session(session_id)
        if not session_info:
            return False

        content = Content(role="user", parts=[Part.from_text(text=message)])

        session_info.live_request_queue.send_content(content=content)
        return True

    def close_session(self, session_id: str) -> bool:
        """Close and cleanup a session.

        Args:
            session_id: The session identifier to close.

        Returns:
            True if session was closed, False if not found.
        """
        session_info = self.sessions.get(session_id)
        if not session_info:
            return False

        session_info.live_request_queue.close()
        session_info.is_active = False

        # Remove from active sessions
        del self.sessions[session_id]

        return True

    def get_active_session_count(self) -> int:
        """Get the number of currently active sessions.

        Returns:
            Count of active sessions.
        """
        return sum(1 for s in self.sessions.values() if s.is_active)


def load_agent(yaml_path: str) -> AgentProtocol:
    """Load a Google ADK agent from a YAML configuration file.

    Args:
        yaml_path: Path to the agent YAML configuration file.

    Returns:
        The loaded agent instance.

    Raises:
        FileNotFoundError: If the YAML file doesn't exist.
        ValueError: If the YAML file is invalid.
    """
    config_path = Path(yaml_path)

    if not config_path.exists():
        raise FileNotFoundError(f"Agent configuration not found: {yaml_path}")

    # Load agent from YAML configuration
    agent = cast(AgentProtocol, config_agent_utils.from_config(str(config_path)))

    return agent
