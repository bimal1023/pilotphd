import anthropic
from ..config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def refine_statement(personal_statement: str) -> str:
    response = await client.messages.create(
        model=settings.claude_model,
        max_tokens=4096,
        system="""You are an expert academic writing coach specializing in PhD
        personal statements. Give honest, specific feedback — not generic praise.
        Always structure your response as:
        ## Feedback
        - What is working
        - What needs improvement
        - Specific suggestions
        ## Refined Version
        [Your rewritten version]""",
        messages=[
            {
                "role": "user",
                "content": f"Please review and refine my personal statement:\n\n{personal_statement}"
            }
        ]
    )
    return response.content[0].text
