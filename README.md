# KairosAI

> **Agentic AI for Market Entry Intelligence** — Seizing the Perfect Moment for Market Success

**KairosAI** (from Greek "καιρός" — the right moment, opportune time) is an agentic AI platform that autonomously analyzes market entry opportunities, competitive landscapes, and strategic positioning to help businesses identify the right moment for market expansion.

---

## Table of Contents

- [Core Capabilities](#core-capabilities)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Core Capabilities

### Autonomous Market Intelligence
- Self-directed research across web sources, social media, and market databases
- Intelligent data synthesis from multiple sources into actionable insights
- Proactive opportunity detection and continuous market monitoring

### Competitive Analysis
- Autonomous competitor discovery and profiling
- Sentiment analysis across digital channels
- Threat assessment and positioning gap detection

### Strategic Decision Support
- Market entry recommendations based on comprehensive analysis
- Go/No-Go decision frameworks with confidence levels
- Investment memo and board presentation generation
- Willingness To Pay (WTP) analysis by customer segment

### Customer Segment Intelligence
- **US–Asia Expansion Focus**: Specialized cross-Pacific market entry analysis
- **Segment-Specific Insights**: SaaS/Tech, Manufacturing, Healthcare, Financial Services, Consumer Goods
- **C-Level Deliverables**: Executive summaries, investment memos, board presentations

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.1 | UI framework |
| TypeScript | 5.x | Type-safe development |
| Vite | 7.0 | Build tool and dev server |
| Chakra UI | 2.10 | Component library |
| TanStack React Query | 5.x | Server state management |
| React Router | 6.x | Client-side routing |
| Recharts | 3.x | Data visualization |
| Framer Motion | 12.x | Animations |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Django | 4.2.7 | Web framework |
| Django REST Framework | 3.14 | API layer |
| Python | 3.10+ | Runtime |
| SQLite | — | Development database |
| PostgreSQL | — | Production database |
| django-allauth | 0.57 | Authentication (email + Google OAuth) |
| SendGrid | 6.11 | Transactional email |
| WeasyPrint | 66.0 | PDF report generation |

### AI Services
| Service | Purpose |
|---|---|
| OpenAI (GPT-4) | Primary AI for analysis and reasoning |
| OpenAI Agents SDK | Agentic research workflows |
| Deep Researcher | Autonomous deep research |
| Serper API | Web search for market research |
| Anthropic Claude | Secondary strategic analysis (optional) |

---

## Project Structure

```
market-entry-intel-platform/
├── frontend/
│   ├── src/
│   │   ├── auth/                  # Authentication (login, register, email verification)
│   │   ├── components/            # Shared UI components
│   │   │   ├── AnalysisForm.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── GoogleAuthButton.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── NavigationBar.tsx
│   │   │   └── SectionHeader.tsx
│   │   ├── config/                # App configuration
│   │   ├── contexts/              # React contexts
│   │   ├── features/              # Feature pages
│   │   │   ├── arbitrage/         # Segment arbitrage analysis
│   │   │   ├── chatbot/           # AI chatbot interface
│   │   │   ├── dashboard/         # Executive intelligence dashboard
│   │   │   ├── landing/           # Landing page
│   │   │   ├── settings/          # User settings
│   │   │   └── support/           # Support pages
│   │   ├── routes/                # Route definitions
│   │   ├── services/              # API service layer
│   │   └── types/                 # TypeScript type definitions
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/
│   └── kairosai/                  # Django project root
│       ├── apps/
│       │   ├── accounts/          # User auth, profiles, email verification
│       │   ├── analysis/          # Market analysis endpoints & chatbot
│       │   ├── companies/         # Company data management
│       │   └── ai_agents/         # Research & scoring agents
│       │       ├── research_agent.py
│       │       ├── scoring_agent.py
│       │       └── chatgpt_service.py
│       ├── kairosai/              # Django settings & config
│       │   ├── settings.py
│       │   ├── settings_production.py
│       │   ├── urls.py
│       │   └── wsgi.py
│       ├── manage.py
│       ├── requirements.txt
│       ├── runtime.txt            # Python 3.11.0 (production)
│       ├── Procfile               # Heroku/Railway process definition
│       └── railway.toml           # Railway deployment config
├── package.json
├── LICENSE                        # MIT
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v16+
- **Python** 3.10+
- **npm** (comes with Node.js)
- **pip** (comes with Python)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/market-entry-intel-platform.git
cd market-entry-intel-platform
```

### 2. Backend setup

```bash
cd backend/kairosai
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at **http://localhost:8000**.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at **http://localhost:5173**.

### 4. Verify

Visit http://localhost:8000/api/v1/health/ — you should see:

```json
{
  "status": "healthy",
  "service": "Market Intelligence API",
  "version": "1.0.0"
}
```

---

## API Reference

Base URL: `http://localhost:8000`

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health/` | Health check |

### Analysis

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/comprehensive-analysis/` | Full market analysis |
| POST | `/api/v1/market-analysis/` | Market analysis |
| POST | `/api/v1/deep-analysis/` | Deep market analysis |
| POST | `/api/v1/quick-analysis/` | Quick market analysis |
| POST | `/api/v1/key-insights/` | Key insights generation |
| POST | `/api/v1/competitor-analysis/` | Competitor analysis |
| POST | `/api/v1/segment-arbitrage/` | Segment arbitrage detection |

### Reports & Chat

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/v1/reports/` | List or create market reports |
| GET | `/api/v1/reports/<id>/` | Get a specific report |
| GET | `/api/v1/latest-dashboard/` | Latest dashboard data |
| GET/POST | `/api/v1/chat/conversations/` | List or create conversations |
| POST | `/api/v1/chat/messages/` | Send a chat message |
| GET | `/api/v1/chat/conversations/<id>/` | Conversation history |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/signup/` | Register |
| POST | `/api/v1/auth/login/` | Login |
| POST | `/api/v1/auth/logout/` | Logout |
| GET | `/api/v1/auth/profile/` | Get user profile |
| PUT | `/api/v1/auth/profile/update/` | Update profile |
| POST | `/api/v1/auth/google-auth/` | Google OAuth login |
| POST | `/api/v1/auth/change-password/` | Change password |
| POST | `/api/v1/auth/change-email/` | Change email |
| POST | `/api/v1/auth/send-verification-email/` | Send verification email |
| POST | `/api/v1/auth/verify-email-code/` | Verify email code |

### Companies

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/v1/companies/` | List or create companies |

### Example Analysis Request

```json
POST /api/v1/comprehensive-analysis/

{
  "company_name": "Acme Corp",
  "industry": "technology",
  "target_market": "Japan",
  "website": "https://acme.com",
  "current_positioning": "Premium B2B SaaS",
  "brand_description": "AI-powered analytics platform",
  "customer_segment": "saas-tech",
  "expansion_direction": "us-to-asia",
  "company_size": "51-200",
  "annual_revenue": "10M-50M",
  "expansion_timeline": "6-12 months",
  "budget_range": "$500K-2M"
}
```

---

## Environment Variables

Create a `.env` file in `backend/kairosai/`:

```env
# Django (defaults exist for all of these — only override as needed)
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# AI Services (required for analysis features)
OPENAI_API_KEY=your-openai-api-key
SERPER_API_KEY=your-serper-api-key

# Optional
ANTHROPIC_API_KEY=your-anthropic-api-key

# Email (required for email verification)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=verification@yourdomain.com

# Google OAuth (required for Google sign-in)
GOOGLE_OAUTH2_CLIENT_ID=your-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-client-secret
```

The server will start without a `.env` file — all values have defaults. AI-powered features (analysis, research agents) require at minimum `OPENAI_API_KEY` and `SERPER_API_KEY`.

The frontend environment is configured via:
- `frontend/.env.development` — points API calls to `http://localhost:8000/api/v1`
- `frontend/.env.production` — points to the production Railway URL

---

## Deployment

The backend is configured for deployment on **Railway**:

- `railway.toml` — build and start commands
- `Procfile` — `gunicorn kairosai.wsgi:application --bind 0.0.0.0:$PORT`
- `build.sh` — pre-deploy script (collectstatic, migrations)
- `runtime.txt` — Python 3.11.0
- `settings_production.py` — production settings (PostgreSQL, WhiteNoise, security headers)

See `railway-setup.md` for detailed deployment instructions.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

[MIT](LICENSE)
