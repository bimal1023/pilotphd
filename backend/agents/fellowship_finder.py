import anthropic
import httpx
from datetime import date
from ..config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

tools = [
    {
        "name": "web_search",
        "description": "Search for PhD fellowships, grants, and funding opportunities",
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
    }
]

SYSTEM_PROMPT = """You are a fellowship research assistant. Your job is to find relevant PhD funding opportunities efficiently.

Rules:
- Do at most 3 searches total. Make them count.
- After your searches, immediately write the final answer — do not search again.
- Return a concise structured list: fellowship name, deadline, brief eligibility, and application link.
- Only include fellowships with future deadlines."""


async def execute_search(query: str) -> str:
    async with httpx.AsyncClient() as http_client:
        response = await http_client.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers={
                "Accept": "application/json",
                "X-Subscription-Token": settings.brave_api_key
            },
            params={"q": query, "count": 3}
        )
        results = response.json().get("web", {}).get("results", [])
        return "\n".join([
            f"Title: {r['title']}\nURL: {r['url']}\nSummary: {r['description']}"
            for r in results
        ])


async def find_fellowships(research_interest: str, profile: str) -> str:
    today = date.today().isoformat()

    messages = [
        {
            "role": "user",
            "content": f"""Today's date is {today}.

Find PhD fellowships and grants for a student with these research interests: {research_interest}

Student profile: {profile}

Only include fellowships with deadlines on or after {today}."""
        }
    ]

    iterations = 0
    while iterations < 4:
        response = await client.messages.create(
            model=settings.claude_model,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=tools,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            if not response.content:
                raise ValueError("Empty response from Claude")
            return response.content[0].text

        if response.stop_reason == "tool_use":
            iterations += 1
            messages.append({"role": "assistant", "content": response.content})

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = await execute_search(block.input["query"])
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            messages.append({"role": "user", "content": tool_results})
        else:
            raise ValueError(f"Unexpected stop reason: {response.stop_reason}")

    raise ValueError("Fellowship search exceeded maximum iterations")
