import json
from groq import Groq

from app.config import get_settings
from app.prompts.roast_prompt import get_roast_prompt


def generate_roast(
    resume_text: str,
    intensity: str = "medium",
    industry: str = "general"
) -> dict:
    """Generate a roast for the given resume text using Groq.

    Args:
        resume_text: The extracted text from the resume PDF
        intensity: Roast intensity level - "mild", "medium", or "brutal"
        industry: Industry persona - "tech", "finance", "creative", "healthcare", or "general"

    Returns:
        dict: The roast response containing score, headline, sections, suggestions, etc.
    """
    settings = get_settings()

    client = Groq(api_key=settings.groq_api_key)
    prompt = get_roast_prompt(resume_text, intensity=intensity, industry=industry)

    # Adjust temperature based on intensity for more creative brutal roasts
    temperature = 0.1 if intensity == "mild" else 0.2 if intensity == "medium" else 0.3

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": "You are a witty resume critic. Always respond with valid JSON only, no markdown code blocks.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=temperature,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)
