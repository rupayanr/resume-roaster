"""Badge detection system for Resume Roaster."""
import re
from typing import Any

# Common buzzwords to detect
BUZZWORDS = [
    "synergy", "leverage", "paradigm", "proactive", "innovative",
    "dynamic", "strategic", "results-driven", "team player",
    "self-starter", "detail-oriented", "passionate", "guru",
    "ninja", "rockstar", "thought leader", "visionary",
    "disruptive", "scalable", "agile", "cross-functional"
]

# Outdated skills that suggest time traveler
OUTDATED_SKILLS = [
    "flash", "actionscript", "coldfusion", "dreamweaver",
    "frontpage", "vbscript", "cobol", "fortran", "pascal",
    "delphi", "foxpro", "clipper", "lotus notes", "microsoft office 2003",
    "internet explorer", "silverlight", "visual basic 6"
]

BADGE_DEFINITIONS = [
    {
        "id": "buzzword_bingo",
        "name": "Buzzword Bingo",
        "icon": "target",
        "description": "Resume is overflowing with corporate jargon"
    },
    {
        "id": "novel_writer",
        "name": "Novel Writer",
        "icon": "book",
        "description": "Resume longer than most Netflix episodes"
    },
    {
        "id": "mystery_candidate",
        "name": "Mystery Candidate",
        "icon": "ghost",
        "description": "Missing basic contact information"
    },
    {
        "id": "time_traveler",
        "name": "Time Traveler",
        "icon": "clock",
        "description": "Skills from a bygone era detected"
    },
    {
        "id": "humble_bragger",
        "name": "Humble Bragger",
        "icon": "medal",
        "description": "\"Responsible for\" everything, apparently"
    },
    {
        "id": "metric_master",
        "name": "Metric Master",
        "icon": "chart",
        "description": "Numbers game is strong"
    },
    {
        "id": "fireproof",
        "name": "Fireproof",
        "icon": "shield",
        "description": "Escaped the roast nearly unscathed"
    },
    {
        "id": "needs_work",
        "name": "Work in Progress",
        "icon": "hard-hat",
        "description": "This resume needs some serious TLC"
    },
    {
        "id": "action_hero",
        "name": "Action Hero",
        "icon": "zap",
        "description": "Strong action verbs throughout"
    },
    {
        "id": "serial_job_hopper",
        "name": "Serial Job Hopper",
        "icon": "repeat",
        "description": "More jobs than years of experience"
    },
    {
        "id": "one_page_wonder",
        "name": "One Page Wonder",
        "icon": "file",
        "description": "Kept it concise and clean"
    },
    {
        "id": "emoji_enthusiast",
        "name": "Emoji Enthusiast",
        "icon": "smile",
        "description": "Emojis detected in a resume... bold choice"
    },
]


def count_buzzwords(text: str) -> int:
    """Count the number of buzzwords in the text."""
    text_lower = text.lower()
    return sum(1 for word in BUZZWORDS if word in text_lower)


def has_contact_info(text: str) -> bool:
    """Check if the resume has basic contact info."""
    # Check for email pattern
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
    # Check for phone pattern
    has_phone = bool(re.search(r'[\d\-\(\)\+\s]{10,}', text))
    return has_email or has_phone


def has_outdated_skills(text: str) -> bool:
    """Check if the resume mentions outdated technologies."""
    text_lower = text.lower()
    return any(skill in text_lower for skill in OUTDATED_SKILLS)


def count_metrics(text: str) -> int:
    """Count quantifiable metrics in the resume."""
    # Look for percentages, dollar amounts, and numbers with context
    percentage_matches = len(re.findall(r'\d+%', text))
    dollar_matches = len(re.findall(r'\$[\d,]+', text))
    number_matches = len(re.findall(r'\b\d+[kKmMbB]?\+?\s*(users|customers|clients|team|people|employees|revenue|sales)', text, re.IGNORECASE))
    return percentage_matches + dollar_matches + number_matches


def count_action_verbs(text: str) -> int:
    """Count strong action verbs at the start of bullet points or sentences."""
    action_verbs = [
        "achieved", "accelerated", "built", "created", "delivered",
        "designed", "developed", "drove", "executed", "generated",
        "implemented", "increased", "launched", "led", "managed",
        "optimized", "reduced", "scaled", "spearheaded", "transformed"
    ]
    text_lower = text.lower()
    return sum(text_lower.count(verb) for verb in action_verbs)


def count_jobs(text: str) -> int:
    """Estimate number of jobs based on common patterns."""
    # Look for date ranges that indicate job periods
    date_patterns = len(re.findall(r'\b(19|20)\d{2}\s*[-–]\s*(present|19|20)\d{0,2}', text, re.IGNORECASE))
    return max(date_patterns, 1)


def estimate_length(text: str) -> int:
    """Estimate resume length in pages based on character count."""
    # Rough estimate: ~3000 chars per page
    return len(text) // 3000 + 1


def has_emojis(text: str) -> bool:
    """Check if the text contains emojis."""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE
    )
    return bool(emoji_pattern.search(text))


def detect_badges(resume_text: str, score: int) -> list[dict[str, Any]]:
    """Detect which badges the resume has earned.

    Args:
        resume_text: The extracted text from the resume
        score: The overall roast score (0-100)

    Returns:
        List of badge dictionaries with id, name, icon, and description
    """
    earned_badges = []

    # Buzzword Bingo - 5+ buzzwords
    if count_buzzwords(resume_text) >= 5:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "buzzword_bingo"))

    # Novel Writer - Very long resume (2+ pages worth of text)
    if estimate_length(resume_text) >= 3:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "novel_writer"))

    # Mystery Candidate - No contact info
    if not has_contact_info(resume_text):
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "mystery_candidate"))

    # Time Traveler - Outdated skills
    if has_outdated_skills(resume_text):
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "time_traveler"))

    # Humble Bragger - Overuse of "responsible for"
    if resume_text.lower().count("responsible for") >= 3:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "humble_bragger"))

    # Metric Master - Lots of quantifiable achievements
    if count_metrics(resume_text) >= 5:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "metric_master"))

    # Fireproof - Excellent score
    if score >= 85:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "fireproof"))

    # Needs Work - Poor score
    if score < 40:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "needs_work"))

    # Action Hero - Lots of action verbs
    if count_action_verbs(resume_text) >= 10:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "action_hero"))

    # Serial Job Hopper - Many jobs
    jobs = count_jobs(resume_text)
    if jobs >= 5:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "serial_job_hopper"))

    # One Page Wonder - Short and sweet
    if estimate_length(resume_text) == 1 and len(resume_text) >= 500:
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "one_page_wonder"))

    # Emoji Enthusiast - Emojis in resume
    if has_emojis(resume_text):
        earned_badges.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "emoji_enthusiast"))

    return earned_badges
