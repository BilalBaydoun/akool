# عَقول (Akool) — Complete Features List

## Platform Overview
- **30+ pages** built with Astro + TypeScript
- **RTL Arabic** with Cairo font, responsive design
- **Dark mode** with system preference detection
- **PWA** installable, sitemap, robots.txt, SEO meta tags
- **$0/month** running cost (free tiers everywhere)

---

## Pages

| Page | Path | Description |
|------|------|-------------|
| Homepage | `/` | All sections assembled |
| Bible Index | `/bible` | Encyclopedia table of contents |
| Bible: What is AI | `/bible/what-is-ai` | 1620 words |
| Bible: AI History | `/bible/ai-history` | 1378 words |
| Bible: Model Types | `/bible/model-types` | 1545 words |
| Bible: Glossary | `/bible/glossary` | 80 AI terms |
| Articles Listing | `/articles` | All articles with search + filters |
| 8 Article Pages | `/articles/*` | Full articles with TOC, reactions, comments, TTS |
| Prompt Enhancer | `/enhancer` | Dedicated page with community prompts |
| Forum Index | `/forum` | Thread list with search |
| 5 Forum Threads | `/forum/1` - `/forum/5` | Individual threads with replies |
| Agents | `/agents` | Meet the AI team |
| Submit Content | `/submit` | Share articles/YouTube with AI review |
| Login | `/login` | Email + Google + Apple sign-in |
| Register | `/register` | Account creation |
| Bookmarks | `/bookmarks` | Saved articles |
| Admin | `/admin` | Dashboard + agent controls |
| 404 | `/404` | Custom error page |

---

## Core Features

### AI Bible / Encyclopedia
- 4 foundation articles (6000+ words total Arabic content)
- 80-term AI glossary with English + Arabic explanations
- Table of contents on each page
- Reading progress bar
- Linked from homepage and navbar

### Articles System
- 8 full articles (1000-2000 words each, all in Arabic)
- Content collections with Zod schemas (type-safe)
- Filter tabs (all / news / tutorials / tips / tools)
- Article detail pages with:
  - Auto-generated table of contents (collapsible)
  - Reading progress bar (fixed top)
  - Reading time + author display
  - Text-to-speech (🔊 استمع) with speed control (0.75x-1.5x)
  - Emoji reactions (👍 مفيد, ❤️ أعجبني, 🔥 رائع, 💡 تعلمت) with counts
  - Share buttons (WhatsApp, Telegram, Twitter/X, copy link)
  - Bookmark/save button (localStorage)
  - AI-moderated comments with threaded replies
  - Related articles (3, same-tag priority)
- Full articles listing page (`/articles`) with search

### Prompt Enhancer
- Template-based enhancement engine (6 task types × 3 languages)
- Homepage component + dedicated page (`/enhancer`)
- Share checkbox — share enhanced prompts with community
- Community prompts section with ratings
- Copy-to-clipboard on all prompts
- Prompt of the Day (14 rotating daily prompts)

### Suggested Prompts
- 8 ready-to-copy professional prompts
- 6 categories: writing, coding, marketing, creative, business, education
- Filter tabs + copy buttons

### Tips & Tricks
- 8 practical AI tips with color-coded categories
- Covers: prompt engineering, productivity, tools comparison

### AI Tools Directory
- 8 curated tools (ChatGPT, Claude, Midjourney, Gemini, Suno, Runway, Notion AI, ElevenLabs)
- Featured badge for top tools
- External links

### Forum
- Thread-based with individual pages (`/forum/{id}`)
- Thread list with search, topic tags, reply counts
- Each thread page shows:
  - Full post with author avatar
  - All replies (human + AI)
  - Quote-reply system (↩️ رد على)
  - ريم (AI agent) auto-replies to every post
  - Guest and logged-in user support
- New post form on forum index
- Posts saved to localStorage (Supabase-ready)

### Comments (on articles)
- Guest commenting (name required, email optional)
- Logged-in user auto-detection (hides guest fields)
- **Real AI moderation by ريم** via `/api/moderate-comment`:
  - Calls Groq LLM to evaluate each comment
  - Approves or rejects with reason
  - Writes personalized AI reply
  - Falls back to regex moderation without API key
- Threaded replies (↩️ reply to specific comments)
- Email notifications via Resend:
  - Approved → confirmation email with AI reply
  - Rejected → email with reason
- Rejected comments logged for admin review

### Content Submission (`/submit`)
- Users share article URLs or YouTube videos
- **Real AI review by دانة** via `/api/review-content`:
  - Calls Groq LLM to evaluate relevance, quality, spam
  - Scores 1-10 (7+ = approved)
  - Returns detailed reason in Arabic
  - Falls back to keyword matching without API key
- Email notification of approval/rejection
- Submission history
- Approved community content section

---

## User System

### Authentication
- Dedicated login (`/login`) and register (`/register`) pages
- Email + password registration
- Google OAuth sign-in
- Apple OAuth sign-in
- Supabase Auth backend (lazy-loaded, works without config)
- Navbar shows "انضم - سجل دخول" for guests, username for logged-in users

### Profiles
- Username, avatar (initial letter)
- Donor status with badge system:
  - 🥉 Bronze ($5+)
  - 🥈 Silver ($20+)
  - 🥇 Gold ($50+)
  - 💎 Platinum ($100+)
- Show/hide donation amount toggle
- Profile page with donation info, submission links, bookmarks

### Donations
- Ko-fi + Patreon integration
- Donation tracking in Supabase
- Auto badge assignment via database trigger

---

## AI Agents (Functional)

### عَقول — CEO & Co-Founder (`agents/ceo-akool.ts`)
- Orchestrates all agents
- Evaluates team performance via LLM
- Makes decisions: hire, fire, reassign, promote, demote, praise, warning
- Generates weekly reports
- Logs all decisions to `agents/ceo-log.json`
- Powers: hire, fire, reassign, promote, demote, evaluate

### نوره — Content Writer (`agents/noura-writer.ts`)
- Picks unused topics from pool (15 topics)
- Generates 1200-1800 word Arabic articles via Groq
- Auto-generates excerpt and reading time
- Saves as markdown with frontmatter

### باسل — News Curator (`agents/basel-news.ts`)
- Generates 5 news headlines, updates NewsTicker component
- Writes weekly news analysis article

### ريم — Forum Manager
- Auto-replies to forum posts and article comments
- Moderates comments via `/api/moderate-comment`
- Reviews content quality

### طارق — Marketing & Growth
- SEO, social media planning (pipeline ready)

### دانة — Content Reviewer
- Reviews user-submitted content via `/api/review-content`
- Scores content 1-10, approves/rejects with reasoning

### GitHub Actions (`.github/workflows/agents.yml`)
- Automated daily cron: Basel 6AM → Noura 8AM → CEO 9AM
- Manual trigger with agent selector
- Auto-commits and pushes → Vercel deploys

---

## UX Features

- **Dark mode** — CSS variables, localStorage, system preference, no flash
- **Global search** — articles + prompts + tools, keyboard shortcut `/`, search highlighting
- **Back to top** — floating button on scroll
- **News ticker** — clickable headlines linking to articles
- **Floating chat widget** — AI chat assistant
- **Cookie consent** — GDPR/AdSense compliance banner
- **404 page** — branded error page
- **Reading stats** — dynamic article/prompt/tool counts
- **Bookmarks** — save articles, dedicated `/bookmarks` page

---

## Admin Dashboard (`/admin`)

- Password-protected (default: `akool2026`)
- Stats overview: articles, guides, agents, pages
- Agent control panel: toggle on/off for each agent
- CEO decision log with timestamps
- Content review: list all articles with delete option
- Danger zone: stop all agents, reset logs

---

## Infrastructure

| Component | Service | Cost |
|-----------|---------|------|
| Framework | Astro + TypeScript | Free |
| Hosting | Vercel | Free |
| Database | Supabase (50K rows) | Free |
| Auth | Supabase Auth | Free |
| AI (agents) | Groq API | Free |
| AI (moderation) | Groq API | Free |
| Email | Resend (100/day) | Free |
| Sitemap | @astrojs/sitemap | Free |
| PWA | manifest.json | Free |
| CI/CD | GitHub Actions | Free |
| **Total** | | **$0/month** |

---

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/moderate-comment` | POST | ريم moderates comments with AI |
| `/api/review-content` | POST | دانة reviews submitted content with AI |

---

## Environment Variables

```
PUBLIC_SUPABASE_URL          # Supabase project URL
PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key
GROQ_API_KEY                 # Groq API for AI agents + moderation
RESEND_API_KEY               # Resend for email notifications
```

All optional — platform works without any of them (fallback to localStorage + regex moderation).
