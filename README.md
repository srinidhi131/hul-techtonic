# Signal-to-Campaign Studio

Project NEXT prototype rebuilt as a **React / Next.js frontend + FastAPI backend**.

## What is included

### Frontend
- Full-screen dark AI-native landing page
- Explore Emerging Signals
- Analyse a New Trend
- Reusable modern cards/components
- Lucide SVG icons
- Tailwind CSS
- API integration with FastAPI

### Backend
- Existing opportunity-score formula
- Existing `trends.csv`
- Brand matching
- `/signals`
- `/analyse-trend`
- CORS configured for local frontend + Vercel previews

---

## 1. Run the backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

FastAPI:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

---

## 2. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create:

```bash
cp .env.local.example .env.local
```

On Windows, you can simply create `.env.local` manually with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Then:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Current flow

```text
Landing
├── Explore emerging signals
│   └── Opportunity Radar
│
└── Analyse a new trend
    └── AI-style command input
        └── FastAPI analysis
```

## Next build stages

1. Opportunity detail page
2. AI-generated campaign brief
3. Creative territory
4. Regional localization
5. Governance checks
6. Human approval
7. Activation status
8. Closed-loop learning

## Deployment

Recommended:
- `frontend/` → Vercel
- `backend/` → Render / Railway / Fly.io

Set `NEXT_PUBLIC_API_BASE_URL` on the frontend deployment to the public backend URL.
