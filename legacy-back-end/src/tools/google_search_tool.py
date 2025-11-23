"""
Google Custom Search tool for ADK agents.

This tool uses the Google Custom Search API to perform web searches,
similar to LangChain's GoogleSearchAPIWrapper used in the notebook.
"""
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false

import os
import ssl

from google.adk.tools import FunctionTool
from googleapiclient.discovery import build  # pyright: ignore[reportMissingTypeStubs]


def google_search(query: str) -> str:
    """
    Perform a Google search for the given query using the Custom Search API.

    Args:
        query: The search query string.

    Returns:
        str: The search results formatted as text, or an error message if the search fails.
    """
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        cse_id = os.getenv("GOOGLE_CSE_ID")

        if not api_key or not cse_id:
            return (
                "Error: GOOGLE_API_KEY or GOOGLE_CSE_ID environment variables not set."
            )

        # Build the Custom Search service
        service = build("customsearch", "v1", developerKey=api_key)

        # Execute the search
        result = service.cse().list(q=query, cx=cse_id).execute()

        # Format the results
        items = result.get("items", [])
        if not items:
            return f"No results found for query: {query}"

        # Format results similar to LangChain's GoogleSearchAPIWrapper
        formatted_results: list[str] = []
        for item in items[:10]:
            title = item.get("title", "No title")
            link = item.get("link", "No link")
            snippet = item.get("snippet", "No snippet")
            formatted_results.append(f"{title}\n{link}\n{snippet}\n")

        return "\n".join(formatted_results)

    except ssl.SSLError as e:
        return f"SSL error during search for query '{query}': {str(e)}"
    except Exception as e:
        return f"Search failed for query '{query}': {str(e)}"


# Create the ADK FunctionTool
google_search_tool = FunctionTool(google_search)
