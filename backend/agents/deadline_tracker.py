import anthropic
from datetime import date
from sqlalchemy.orm import Session
from ..config import settings
from ..models.application import Application, ApplicationStatus

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def get_deadline_briefing(db: Session) -> str:
    today = date.today()

    applications = db.query(Application).filter(
        Application.status.in_([
            ApplicationStatus.PLANNING,
            ApplicationStatus.APPLIED,
            ApplicationStatus.WAITING
        ])
    ).all()

    app_data = "\n".join([
        f"- {app.university} ({app.program}): "
        f"deadline {app.deadline}, status {app.status.value}, "
        f"professors {app.professors}"
        for app in applications
    ])

    response = await client.messages.create(
        model=settings.claude_model,
        max_tokens=1024,
        system="""You are a PhD application advisor.
        Analyze the student's application deadlines and give clear,
        prioritized action items. Be specific and urgent where needed.""",
        messages=[
            {
                "role": "user",
                "content": f"Today is {today}. Here are my current applications:\n\n{app_data}\n\nWhat should I focus on and what deadlines are coming up?"
            }
        ]
    )
    return response.content[0].text
