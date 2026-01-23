# Resume Roaster — System Design Document

## Overview

**Resume Roaster** is a fun, useful tool that critiques resumes with brutal honesty and humor while providing actionable improvements. Upload a PDF, get roasted, get better.

**Why this project?**  
Demonstrates file upload/processing, PDF parsing, LLM integration, and creates something viral-worthy. Relatable problem, fun execution.

---

## Features

### MVP (Must Have)

- [ ] Drag & drop PDF upload
- [ ] Extract text from PDF
- [ ] AI generates roast with humor
- [ ] Structured feedback (good/bad/fixable)
- [ ] Before/after improvement suggestions
- [ ] Score out of 100
- [ ] Shareable results link

### Nice to Have (Post-MVP)

- [ ] Industry-specific roasts (tech, finance, design)
- [ ] ATS compatibility score
- [ ] Download "fixed" resume
- [ ] Anonymous roast gallery
- [ ] Social sharing cards

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  DropZone   │  │   Roast     │  │      Share          │  │
│  │  (upload)   │  │   Display   │  │      Button         │  │
│  └──────┬──────┘  └──────▲──────┘  └──────────▲──────────┘  │
│         │                │                     │             │
│         │         ┌──────┴─────────────────────┘             │
│         │         │                                          │
│         ▼         │                                          │
│  ┌────────────────┴─────────────────────────────────────┐   │
│  │                     REST API Client                   │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────┘
                              │
                    POST /api/v1/roast (multipart)
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                        BACKEND                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   FastAPI Server                     │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   Upload    │  │    PDF      │  │   Roaster   │  │    │
│  │  │   Handler   │  │   Parser    │  │   (GPT-4)   │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │    │
│  └─────────┼────────────────┼────────────────┼─────────┘    │
│            │                │                │               │
│            ▼                ▼                ▼               │
│         PDF file ──► Text extraction ──► LLM roast          │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Reasoning |
|-------|------------|-----------|
| Frontend | React + TypeScript | Consistency |
| Upload | react-dropzone | Best DX for file drops |
| Animations | Framer Motion | Polish |
| Backend | FastAPI | Async file handling |
| PDF Parsing | pdfplumber | Better than PyPDF2 for text |
| LLM | OpenAI GPT-4 | Best at structured humor |
| Hosting | Vercel + Railway | Free tiers |

---

## API Specification

### Upload and Roast

```
POST /api/v1/roast
Content-Type: multipart/form-data

Body:
- file: PDF file (max 5MB)
- industry: string (optional) - "tech", "finance", "general"

Response:
{
  "id": "roast_abc123",
  "score": 65,
  "breakdown": {
    "clarity": 70,
    "impact": 55,
    "relevance": 75,
    "format": 60
  },
  "roast": {
    "headline": "Your resume is like a beige wall...",
    "sections": [
      {
        "title": "The Good",
        "icon": "✅",
        "points": [
          "Solid technical skills section",
          "Good use of metrics in achievements"
        ]
      },
      {
        "title": "The Bad",
        "icon": "😬",
        "points": [
          "Your summary reads like LinkedIn auto-generated it",
          "Three pages? This isn't a novel."
        ]
      },
      {
        "title": "The Fixable",
        "icon": "🔧",
        "points": [
          "Lead with impact, not responsibilities",
          "Cut the fluff - 'synergy' isn't a skill"
        ]
      }
    ]
  },
  "suggestions": [
    {
      "category": "Experience",
      "original": "Responsible for managing team projects",
      "improved": "Led 5-person team delivering $2M revenue product",
      "why": "Specifics beat vague responsibilities"
    },
    {
      "category": "Skills",
      "original": "Proficient in various programming languages",
      "improved": "Python, TypeScript, Go | Built systems handling 10K req/sec",
      "why": "Show, don't tell"
    }
  ],
  "ats_tips": [
    "Add more keywords from job descriptions",
    "Use standard section headers"
  ],
  "share_url": "https://resumeroaster.dev/r/abc123"
}
```

### Get Shared Roast

```
GET /api/v1/roast/{id}

Response: Same structure as above
```

---

## PDF Parsing

```python
# core/pdf_parser.py
import pdfplumber

def extract_text(file_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    
    # Clean up
    text = " ".join(text.split())  # Normalize whitespace
    
    if len(text) < 100:
        raise ValueError("Could not extract text from PDF")
    
    return text
```

---

## LLM Roaster

```python
# core/roaster.py
from openai import AsyncOpenAI

SYSTEM_PROMPT = """
You are Resume Roaster, a brutally honest resume reviewer with a sharp sense of humor.

Your personality:
- Witty but not cruel
- Direct and specific
- Actually helpful underneath the roast

Scoring (0-100):
- Clarity (25%): Is it easy to understand?
- Impact (25%): Do achievements have numbers/results?
- Relevance (25%): Is content targeted to roles?
- Format (25%): Layout, length, readability

Output JSON matching this schema exactly:
{
  "score": number,
  "breakdown": { "clarity": n, "impact": n, "relevance": n, "format": n },
  "headline": "one-liner roast",
  "sections": [
    { "title": "The Good", "icon": "✅", "points": ["..."] },
    { "title": "The Bad", "icon": "😬", "points": ["..."] },
    { "title": "The Fixable", "icon": "🔧", "points": ["..."] }
  ],
  "suggestions": [
    { "category": "...", "original": "...", "improved": "...", "why": "..." }
  ],
  "ats_tips": ["..."]
}
"""

async def roast_resume(text: str, industry: str = "general") -> dict:
    client = AsyncOpenAI()
    
    response = await client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Industry: {industry}\n\nResume:\n{text}"}
        ],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)
```

---

## Frontend Structure

```
resume-roaster/frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   ├── Home.tsx           # Upload page
│   │   └── Roast.tsx          # Results page
│   ├── components/
│   │   ├── Upload/
│   │   │   ├── DropZone.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   └── UploadProgress.tsx
│   │   ├── Roast/
│   │   │   ├── RoastCard.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   ├── ScoreBreakdown.tsx
│   │   │   ├── FeedbackSection.tsx
│   │   │   └── SuggestionCard.tsx
│   │   ├── Share/
│   │   │   ├── ShareButton.tsx
│   │   │   └── SocialCard.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── Container.tsx
│   ├── hooks/
│   │   ├── useFileUpload.ts
│   │   └── useRoast.ts
│   ├── lib/
│   │   └── api.ts
│   └── types/
│       └── index.ts
├── package.json
└── ...
```

---

## Backend Structure

```
resume-roaster/backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── routes/
│   │   │   └── roast.py
│   │   └── deps.py
│   ├── core/
│   │   ├── pdf_parser.py
│   │   └── roaster.py
│   ├── prompts/
│   │   └── roast_prompt.py
│   ├── schemas/
│   │   └── roast.py
│   └── storage/
│       └── roast_store.py    # Simple in-memory or Redis
├── requirements.txt
└── Dockerfile
```

---

## Storage for Sharing

Simple approach for MVP (no database needed):

```python
# storage/roast_store.py
import hashlib
import json
from datetime import datetime, timedelta

# In-memory store (use Redis in production)
_roasts: dict[str, dict] = {}

def save_roast(roast: dict) -> str:
    # Generate short ID
    content = json.dumps(roast) + str(datetime.now())
    roast_id = hashlib.sha256(content.encode()).hexdigest()[:8]
    
    _roasts[roast_id] = {
        "data": roast,
        "created_at": datetime.now()
    }
    
    return roast_id

def get_roast(roast_id: str) -> dict | None:
    entry = _roasts.get(roast_id)
    if not entry:
        return None
    
    # Expire after 7 days
    if datetime.now() - entry["created_at"] > timedelta(days=7):
        del _roasts[roast_id]
        return None
    
    return entry["data"]
```

---

## UI Components

### Score Display

```tsx
// components/Roast/ScoreDisplay.tsx
import { motion } from 'framer-motion'

export function ScoreDisplay({ score }: { score: number }) {
  const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative w-32 h-32"
    >
      <svg className="w-full h-full">
        <circle
          cx="64" cy="64" r="56"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${score * 3.5} 350`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
        {score}
      </span>
    </motion.div>
  )
}
```

### Suggestion Card

```tsx
// components/Roast/SuggestionCard.tsx
export function SuggestionCard({ suggestion }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <span className="text-sm text-gray-500">{suggestion.category}</span>
      
      <div className="flex gap-4">
        <div className="flex-1 bg-red-50 p-3 rounded">
          <p className="text-sm text-red-800 line-through">
            {suggestion.original}
          </p>
        </div>
        <div className="flex-1 bg-green-50 p-3 rounded">
          <p className="text-sm text-green-800">
            {suggestion.improved}
          </p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">
        💡 {suggestion.why}
      </p>
    </div>
  )
}
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| File too large | Reject with "Max 5MB" message |
| Not a PDF | Show file type error |
| Can't extract text | "Couldn't read this PDF - try a different format" |
| LLM fails | Retry once, then show error |
| Empty resume | "This resume is... impressively empty" |

---

## Cost Estimation

| Service | Usage | Cost |
|---------|-------|------|
| GPT-4 Turbo | ~$0.02/roast | ~$2/100 roasts |
| Railway | Hobby tier | $0 |
| Vercel | Free tier | $0 |

---

## Milestones

| Week | Goal | Deliverable |
|------|------|-------------|
| 7 | Upload + PDF parsing | Text extraction working |
| 8 | GPT-4 roasting | Full roast generation |
| 9 | UI + sharing + deploy | **Resume Roaster shipped** |

---

*Last updated: January 2025*
