import anthropic
import httpx
from ..config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

tools = [
    {
        "name": "web_search",
        "description": "Search the web for a professor's recent research and publications",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "read_document",
        "description": "Read the user's personal statement or research interest document",
        "input_schema": {
            "type": "object",
            "properties": {
                "document_type": {
                    "type": "string",
                    "enum": ["personal_statement", "research_interest"],
                    "description": "Which document to read"
                }
            },
            "required": ["document_type"]
        }
    }
]


async def execute_tool(tool_name: str, tool_input: dict, user_documents: dict) -> str:
    if tool_name == "web_search":
        query = tool_input["query"]
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(
                "https://api.search.brave.com/res/v1/web/search",
                headers={
                    "Accept": "application/json",
                    "X-Subscription-Token": settings.brave_api_key
                },
                params={"q": query, "count": 5}
            )
            results = response.json().get("web", {}).get("results", [])
            return "\n".join([
                f"Title: {r['title']}\nURL: {r['url']}\nSummary: {r['description']}"
                for r in results
            ])

    elif tool_name == "read_document":
        doc_type = tool_input["document_type"]
        return user_documents.get(doc_type, "Document not found")

    return "Tool not found"


async def draft_email(professor_name: str, university: str, user_documents: dict) -> str:
    messages = [
        {
            "role": "user",
            "content": f"""Draft a personalized cold email to Professor {professor_name}
            at {university}.
            Search for their recent research first, then read my personal statement,
            then write a genuine, specific email that connects my background to their work.
            Keep it concise — under 200 words."""
        }
    ]

    while True:
        response = await client.messages.create(
            model=settings.claude_model,
            max_tokens=2048,
            tools=tools,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            if not response.content:
                raise ValueError("Empty response from Claude")
            return response.content[0].text

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = await execute_tool(block.name, block.input, user_documents)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            messages.append({"role": "user", "content": tool_results})
        else:
            raise ValueError(f"Unexpected stop reason: {response.stop_reason}")
