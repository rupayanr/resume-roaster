# CLAUDE.md — Resume Roaster

## Project Overview

Upload your resume PDF → get brutally honest AI feedback + actionable suggestions. Fun, useful, and demonstrates file processing + LLM skills.

**Owner:** Rupayan Roy  
**Timeline:** Replaces Vox in weeks 7–9 (Mar 3 – Mar 23)  
**Live URL:** resumeroaster.rupayan.dev (planned)  
**Design Doc:** `docs/resume-roaster-design.md`

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- react-dropzone (file upload)
- Framer Motion (animations)

### Backend
- Python 3.11+
- FastAPI
- PyMuPDF or pdfplumber (PDF parsing)
- OpenAI GPT-4 (roasting + suggestions)

### Infrastructure
- Vercel (frontend)
- Railway (backend)

---

## Features

### MVP

- [ ] Drag & drop PDF upload
- [ ] Extract text from PDF
- [ ] AI roast with humor + honesty
- [ ] Structured feedback sections
- [ ] Actionable improvement suggestions
- [ ] Score/rating system
- [ ] Share roast results

### Nice to Have

- [ ] Side-by-side before/after suggestions
- [ ] Industry-specific feedback (tech, finance, etc.)
- [ ] ATS compatibility check
- [ ] Download improved version
- [ ] Anonymous roast gallery

---

## Project Structure

```
resume-roaster/
├── CLAUDE.md
├── README.md
├── docs/
│   └── resume-roaster-design.md
├── frontend/
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── Upload/
│       │   │   ├── DropZone.tsx
│       │   │   └── FilePreview.tsx
│       │   ├── Roast/
│       │   │   ├── RoastCard.tsx
│       │   │   ├── ScoreDisplay.tsx
│       │   │   ├── FeedbackSection.tsx
│       │   │   └── Suggestions.tsx
│       │   ├── Share/
│       │   │   └── ShareButton.tsx
│       │   └── Layout/
│       │       └── Container.tsx
│       ├── hooks/
│       │   ├── useFileUpload.ts
│       │   └── useRoast.ts
│       ├── lib/
│       │   └── api.ts
│       └── types/
│           └── index.ts
└── backend/
    ├── requirements.txt
    ├── Dockerfile
    └── app/
        ├── main.py
        ├── config.py
        ├── api/
        │   └── routes/
        │       └── roast.py
        ├── core/
        │   ├── pdf_parser.py
        │   └── roaster.py
        └── prompts/
            └── roast_prompt.py
```

---

## Data Flow

```
┌─────────────────┐
│  User uploads   │
│   resume.pdf    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │
│  (react-dropzone)│
└────────┬────────┘
         │ POST /api/v1/roast
         │ multipart/form-data
         ▼
┌─────────────────┐
│  Backend        │
│  FastAPI        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PDF Parser     │
│  (pdfplumber)   │
└────────┬────────┘
         │ extracted text
         ▼
┌─────────────────┐
│  GPT-4          │
│  Roast + Suggest│
└────────┬────────┘
         │ structured response
         ▼
┌─────────────────┐
│  Frontend       │
│  Display roast  │
└─────────────────┘
```

---

## API Specification

### Roast Resume

```
POST /api/v1/roast
Content-Type: multipart/form-data

Body:
- file: resume.pdf

Response:
{
  "id": "roast_abc123",
  "score": 65,
  "roast": {
    "headline": "Your resume is like a beige wall - technically there, but nobody's looking at it.",
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
          "Your summary reads like a LinkedIn auto-generate gone wrong",
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
      "original": "Responsible for managing team projects",
      "improved": "Led 5-person team delivering $2M revenue product",
      "why": "Specifics beat vague responsibilities every time"
    }
  ],
  "ats_score": 72,
  "share_url": "https://resumeroaster.dev/r/abc123"
}
```

### Get Roast by ID (for sharing)

```
GET /api/v1/roast/{id}

Response: Same as above
```

---

## LLM Prompt Structure

```python
ROAST_PROMPT = """
You are a brutally honest resume reviewer with a sense of humor. Your job is to roast this resume while providing genuinely useful feedback.

Rules:
1. Be funny but not mean-spirited
2. Point out real issues with specific examples
3. Give actionable suggestions with before/after examples
4. Score from 0-100 based on:
   - Clarity (25%)
   - Impact/Metrics (25%)
   - Relevance (25%)
   - Format/Readability (25%)

Output format: JSON with structure:
{
  "score": <number>,
  "headline": "<one-liner roast>",
  "sections": [
    {"title": "The Good", "icon": "✅", "points": [...]},
    {"title": "The Bad", "icon": "😬", "points": [...]},
    {"title": "The Fixable", "icon": "🔧", "points": [...]}
  ],
  "suggestions": [
    {"original": "...", "improved": "...", "why": "..."}
  ],
  "ats_tips": [...]
}

Resume text:
{resume_text}
"""
```

---

## Frontend Components

### DropZone

```tsx
// components/Upload/DropZone.tsx
import { useDropzone } from 'react-dropzone'

export function DropZone({ onUpload }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (files) => onUpload(files[0])
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-12 rounded-xl">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop your resume here...</p>
      ) : (
        <p>Drag & drop your resume PDF, or click to select</p>
      )}
    </div>
  )
}
```

### RoastCard

```tsx
// components/Roast/RoastCard.tsx
import { motion } from 'framer-motion'

export function RoastCard({ roast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <ScoreDisplay score={roast.score} />
      <h2 className="text-2xl font-bold mt-4">{roast.headline}</h2>
      {roast.sections.map(section => (
        <FeedbackSection key={section.title} {...section} />
      ))}
    </motion.div>
  )
}
```

---

## Key Dependencies

### Frontend
```json
{
  "react-dropzone": "^14.2.0",
  "framer-motion": "^11.0.0",
  "axios": "^1.6.0"
}
```

### Backend
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
python-multipart>=0.0.9
pdfplumber>=0.10.0
openai>=1.10.0
```

---

## Commands

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=sk-...
CORS_ORIGINS=["http://localhost:5173"]
MAX_FILE_SIZE_MB=5
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

---

## Milestones

- [ ] Week 7: PDF upload + parsing
- [ ] Week 8: GPT-4 integration + roast generation
- [ ] Week 9: UI polish, sharing, deploy

---

*Last updated: January 2025*
