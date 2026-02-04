import json
import ollama

from app.config import get_settings
from app.prompts.roast_prompt import ROAST_PROMPT


def generate_roast(resume_text: str) -> dict:
    """Generate a roast for the given resume text using Ollama."""
    settings = get_settings()

    client = ollama.Client(host=settings.ollama_host)
    prompt = ROAST_PROMPT.format(resume_text=resume_text)

    response = client.chat(
        model=settings.ollama_model,
        messages=[
            {
                "role": "system",
                "content": "You are a witty resume critic. Always respond with valid JSON only, no markdown.",
            },
            {"role": "user", "content": prompt},
        ],
        format="json",
        options={"temperature": 0.1},  # Low temperature for consistent scoring
    )

    content = response["message"]["content"]
    return json.loads(content)
