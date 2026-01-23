# Resume Roaster

Upload your resume. Get roasted. Get better.

![Resume Roaster Preview](preview.png)

## ✨ Features

- **Drag & Drop Upload** — Just drop your PDF
- **Brutal Honesty** — AI feedback that doesn't sugarcoat
- **Actual Suggestions** — Before/after improvements
- **Score** — 0-100 rating with breakdown
- **Shareable** — Show friends your roast

## 🛠 Tech Stack

**Frontend:** React, TypeScript, Tailwind, Framer Motion  
**Backend:** FastAPI, pdfplumber, OpenAI GPT-4

## 🚀 Quick Start

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export OPENAI_API_KEY=sk-...

uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🔥 Sample Roast

**Score: 65/100**

> "Your resume is like a beige wall - technically there, but nobody's looking at it."

### ✅ The Good
- Solid technical skills section
- Good use of metrics in some achievements

### 😬 The Bad
- Your summary reads like LinkedIn auto-generated it
- Three pages? This isn't a novel.

### 🔧 The Fixable

| Before | After |
|--------|-------|
| "Responsible for managing team projects" | "Led 5-person team delivering $2M revenue product" |
| "Worked on various technologies" | "Built microservices handling 10K req/sec in Go" |

## 📁 Project Structure

```
resume-roaster/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Upload/      # Dropzone
│       │   ├── Roast/       # Feedback display
│       │   └── Share/       # Share button
│       └── hooks/
└── backend/
    └── app/
        ├── api/             # Endpoints
        ├── core/            # PDF + AI logic
        └── prompts/         # LLM prompts
```

## 🔧 Environment Variables

**Backend (.env):**
```
OPENAI_API_KEY=sk-...
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8000
```

## 📊 API

```
POST /api/v1/roast        # Upload PDF, get roast
GET  /api/v1/roast/{id}   # Get roast by ID (for sharing)
```

## 💰 Cost

~$0.02 per roast (GPT-4 API)

## 📝 License

MIT

---

Made with 🔥 by [Rupayan Roy](https://linkedin.com/in/rupayan-roy)
