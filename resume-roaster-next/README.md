# Resume Roaster (Next.js)

Upload your resume PDF and get brutally honest AI feedback with actionable suggestions.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Prisma** - Database ORM
- **Vercel Postgres** - Database
- **Groq SDK** - LLM API (llama-3.1-70b)
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Vercel Postgres)
- Groq API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables

```env
GROQ_API_KEY=gsk_...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
```

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add Vercel Postgres from the Storage tab
4. Add `GROQ_API_KEY` to environment variables
5. Deploy

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/roast` | Upload PDF, get roast |
| GET | `/api/roast/[shareId]` | Get roast by share ID |
| POST | `/api/roast/[shareId]/react` | Add reaction |
| PATCH | `/api/roast/[shareId]/public` | Toggle public visibility |
| GET | `/api/hot-takes` | Get public roast headlines |
| GET | `/api/roast/[shareId]/og-image` | Generate OG image |

## Project Structure

```
resume-roaster-next/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── r/[shareId]/      # Shared roast page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/
│   ├── roaster.ts        # Groq LLM integration
│   ├── badges.ts         # Badge detection
│   ├── pdf.ts            # PDF parsing
│   └── db.ts             # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── index.ts          # TypeScript types
```
