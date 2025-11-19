"""Hello World Agent using Google ADK."""

from google.adk.agents.llm_agent import Agent

# Define the root agent
root_agent = Agent(
    model="gemini-2.0-flash-exp",
    name="hello_world_agent",
    description="A simple Hello World agent that greets users warmly.",
    instruction=(
        "You are a friendly Hello World agent. "
        "When a user greets you or asks anything, respond with 'Hello, World!' "
        "followed by a brief, warm explanation of what you are and how you can help. "
        "Keep your responses concise and cheerful."
    ),
)
