# عَقول (Akool) — Project Plan

## Vision
The definitive Arabic AI bible — a comprehensive, free platform managed entirely by AI agents.
Covers foundations, guides, news, tips, tools, forum, and prompt engineering.
Open source, hosted on Vercel, zero cost to users.

---

## Branding
- **Name:** عَقول (Oqool) — "Minds"
- **Brand icon:** ع (green gradient)
- **Mascot:** Friendly robot with Arabic calligraphy elements (AI-generated artwork)
- **Colors:** Green accent (#1A6B4A), light warm background (#F8F7F4)
- **Font:** Cairo (Arabic)

---

## Tech Stack
| Layer | Choice | Cost |
|-------|--------|------|
| Framework | Astro + TypeScript | Free |
| Styling | Existing style.css (RTL, Cairo font) | — |
| Forum backend | Supabase (free tier: 50K rows, 500MB) | Free |
| AI Agents | GitHub Actions cron + Groq/Gemini free APIs | Free |
| Hosting | Vercel (free tier, 100GB bandwidth) | Free |
| Repository | GitHub (public, open source) | Free |
| Ads | Google AdSense | Revenue |
| Donations | Ko-fi / Patreon | Revenue |

---

## Project Structure

```
oqool/
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── public/
│   ├── images/
│   │   └── mascot.svg
│   └── favicon.ico
├── src/
│   ├── styles/
│   │   └── global.css                ← existing style.css
│   ├── layouts/
│   │   └── BaseLayout.astro          ← HTML shell (RTL, meta, fonts)
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Hero.astro                ← mentions AI agent management
│   │   ├── NewsTicker.astro
│   │   ├── AdSlot.astro              ← reusable Google AdSense slot
│   │   ├── BiblePreview.astro        ← featured foundations & guides
│   │   ├── ArticleGrid.astro
│   │   ├── FilterTabs.astro
│   │   ├── PromptEnhancer.astro      ← interactive island (client:visible)
│   │   ├── SuggestedPrompts.astro
│   │   ├── TipsGrid.astro
│   │   ├── ToolsGrid.astro
│   │   ├── ForumPreview.astro        ← latest forum threads on homepage
│   │   ├── SourceCode.astro
│   │   ├── Donate.astro
│   │   ├── Newsletter.astro
│   │   ├── Footer.astro
│   │   └── ChatWidget.astro          ← interactive island (client:idle)
│   ├── scripts/
│   │   ├── prompt-enhancer.ts        ← template-based enhancement logic
│   │   ├── chat-widget.ts
│   │   ├── navbar.ts                 ← scroll, mobile toggle
│   │   ├── filters.ts               ← article/prompt filter tabs
│   │   ├── forum.ts                  ← forum post/reply logic (Supabase)
│   │   ├── newsletter.ts
│   │   └── counter.ts               ← hero stats animation
│   ├── content/
│   │   ├── config.ts                 ← Zod schemas for all collections
│   │   ├── foundations/              ← AI Bible core knowledge
│   │   │   ├── what-is-ai.md
│   │   │   ├── ai-history.md
│   │   │   ├── model-types.md
│   │   │   └── glossary.md
│   │   ├── guides/                   ← comprehensive tool/skill guides
│   │   │   ├── chatgpt-complete.md
│   │   │   ├── midjourney-complete.md
│   │   │   └── prompt-engineering.md
│   │   ├── articles/                 ← AI agent daily content
│   │   ├── tips/                     ← tips & tricks
│   │   └── tools/                    ← AI tools directory entries
│   ├── pages/
│   │   ├── index.astro               ← homepage (assembles all sections)
│   │   ├── bible/
│   │   │   ├── index.astro           ← knowledge base table of contents
│   │   │   └── [slug].astro          ← individual knowledge page
│   │   ├── articles/
│   │   │   ├── index.astro           ← all articles listing
│   │   │   └── [slug].astro          ← article detail page
│   │   ├── forum/
│   │   │   ├── index.astro           ← forum listing
│   │   │   └── [id].astro            ← thread view with AI replies
│   │   ├── api/
│   │   │   ├── forum-post.ts         ← Vercel Edge: create forum post
│   │   │   ├── ai-reply.ts           ← Vercel Edge: AI bot replies
│   │   │   └── enhance.ts            ← Vercel Edge: prompt enhancer API (optional)
│   │   └── 404.astro
│   └── data/
│       ├── tools.ts                  ← curated tools list
│       └── prompts.ts                ← suggested prompts data
├── .github/
│   └── workflows/
│       └── ai-content.yml            ← AI agent cron pipeline
└── vercel.json
```

---

## Homepage Sections (in order)

1. **Navbar** — ع عَقول brand, nav links, donate button, mobile menu
2. **Hero** — "البوابة العربية الشاملة للذكاء الاصطناعي — تُدار بوكلاء AI"
3. **News Ticker** — auto-updated AI news
4. **Ad Slot** — Google AdSense leaderboard
5. **Bible Preview** — featured foundations & guides (the core differentiator)
6. **Latest Articles** — AI-generated daily content with filter tabs
7. **Ad Slot** — Google AdSense rectangle
8. **Prompt Enhancer** — interactive tool
9. **Suggested Prompts** — ready-to-copy categorized prompts
10. **Tips & Tricks** — practical AI tips
11. **AI Tools Directory** — curated free tools
12. **Forum Preview** — latest threads with AI bot replies
13. **Ad Slot** — Google AdSense rectangle
14. **Source Code** — open source explanation, how the site was built
15. **Donate** — Ko-fi / Patreon
16. **Newsletter** — email subscription
17. **Footer** — links, social, credits
18. **Floating Chat Widget** — AI assistant

---

## Content Architecture (The AI Bible)

### Foundations (الأساسيات)
Core knowledge that rarely changes. Written once, updated periodically.
- ما هو الذكاء الاصطناعي؟
- تاريخ AI من البداية للآن
- أنواع النماذج (LLMs, Diffusion, RL, etc.)
- قاموس مصطلحات AI (glossary)
- كيف تبدأ رحلتك مع AI
- أخلاقيات الذكاء الاصطناعي

### Guides (الدليل الشامل)
Deep-dive guides for specific tools and skills.
- دليل ChatGPT الكامل
- دليل Claude الكامل
- دليل Midjourney / DALL-E الكامل
- دليل البرومبت الاحترافي
- دليل أتمتة العمل بـ AI
- دليل البرمجة مع AI

### Articles (مقالات)
Daily content generated by AI agents. Categories:
- أخبار AI
- دروس تعليمية
- نصائح وحيل
- أدوات جديدة
- فرص وتطبيقات (replaces "money" section — naturally integrated)

---

## Forum Architecture

### How it works
1. User posts a question/topic (no account needed for MVP)
2. Post saved to Supabase
3. Vercel Edge Function triggers AI bot reply via Groq/Gemini
4. AI reply saved to Supabase under same thread
5. Forum page renders threads from Supabase

### Supabase Tables
- `forum_threads` — id, title, body, author_name, created_at, category
- `forum_replies` — id, thread_id, body, author_name, is_ai_bot, created_at

### Categories
- أسئلة عامة
- مشاكل تقنية
- مشاركة مشاريع
- نقاشات
- طلب مساعدة

---

## Prompt Enhancer

### Default mode (free, no API)
Template-based TypeScript engine:
1. Parse input prompt
2. Detect task type (writing, coding, creative, analysis, marketing)
3. Apply structured template: Role + Context + Task + Format + Constraints
4. Show before/after with improvement score
5. Copy-to-clipboard

### Upgrade mode (with API key)
Vercel Edge Function calls Groq/Gemini for smarter enhancement.
Activated when environment variable `ENHANCE_API_KEY` is set.

---

## AI Agent Pipeline

### GitHub Actions Workflow
```
Schedule: Daily at 8:00 AM UTC
Steps:
  1. Fetch trending AI topics (NewsAPI free / web scraping)
  2. Call Groq/Gemini to generate article in Arabic
  3. Format as Markdown with frontmatter
  4. Commit to src/content/articles/
  5. Push → Vercel auto-deploys
```

### Agent Roles
- **Content Writer** — generates 1-2 articles/day
- **News Curator** — updates ticker data
- **Tips Generator** — weekly tips batch
- **Forum Responder** — replies to forum posts (via Supabase + Edge Function)

### API Keys (GitHub Secrets)
- `GROQ_API_KEY` or `GEMINI_API_KEY`
- `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- `NEWS_API_KEY` (optional)

---

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Initialize Astro project with TypeScript
- [x] Copy style.css → src/styles/global.css
- [x] Create BaseLayout.astro (RTL, Cairo font, meta tags)
- [x] Create Navbar.astro with scroll behavior + mobile toggle
- [x] Create Hero.astro with animated counters
- [x] Create Footer.astro
- [x] Wire up index.astro
- [x] Delete old index.html

### Phase 2: Bible & Content ✅
- [x] Set up content collections (content.config.ts with Zod schemas)
- [x] Create BiblePreview.astro component
- [x] Create ArticleGrid.astro with filter tabs
- [x] Write 8 full articles (1000-2000 words each)
- [x] Create articles/[slug].astro detail page
- [x] Create AdSlot.astro component
- [ ] Write foundation articles (what-is-ai, history, glossary)
- [ ] Create bible/index.astro and bible/[slug].astro pages

### Phase 3: Tools & Prompts ✅
- [x] Create SuggestedPrompts.astro (8 prompts, 6 categories)
- [x] Create TipsGrid.astro (8 tips)
- [x] Create ToolsGrid.astro (8 tools)
- [x] Create PromptEnhancer.astro (template-based, fully interactive)
- [x] Create NewsTicker.astro

### Phase 4: Forum ✅ (MVP)
- [x] Create forum/index.astro with search
- [x] Create ForumPreview.astro (latest 2 posts on homepage)
- [x] AI bot replies (client-side demo)
- [ ] Set up Supabase for persistence
- [ ] User registration and authentication
- [ ] Human-to-human interaction (comments/replies)
- [ ] Premium user avatars
- [ ] Donation tracking per user

### Phase 5: Interactive Features ✅
- [x] Create ChatWidget.astro (floating AI chat)
- [x] Create Donate.astro
- [x] Create Newsletter.astro
- [x] Create SourceCode.astro

### Phase 6: UX Enhancements ✅
- [x] Dark mode (CSS variables + localStorage + system preference)
- [x] Global search (articles, prompts, tools — keyboard shortcut: /)
- [x] Table of contents (auto-generated, collapsible)
- [x] Reading progress bar
- [x] Share buttons (WhatsApp, Telegram, Twitter)
- [x] Related articles (3 articles, same-tag priority)
- [x] Back to top button
- [x] 404 page (custom branded)

### Phase 7: AI Agent Pipeline (TODO)
- [ ] Create .github/workflows/ai-content.yml
- [ ] Write content generation TypeScript scripts
- [ ] Set up API keys as GitHub Secrets
- [ ] Test pipeline: agent → article → deploy
- [ ] Set up forum auto-responder

### Phase 8: Polish & Launch (TODO)
- [ ] Generate mascot artwork (AI tools)
- [ ] Create favicon and OG images
- [ ] Integrate Google AdSense
- [ ] Set up Ko-fi / Patreon, update links
- [ ] SEO (meta tags, sitemap, structured data)
- [ ] Performance audit (Lighthouse)
- [ ] Mobile testing
- [ ] Write "how this site was built" article
- [ ] Git init, push to GitHub, deploy to Vercel
- [ ] Launch 🚀

---

## Potential Challenges

| Challenge | Mitigation |
|-----------|------------|
| AdSense approval needs content | Launch AI pipeline first, accumulate 20+ articles before applying |
| AI content quality | Detailed system prompts, review step in GitHub Action |
| Free API rate limits | One article/day is within limits, batch during off-peak |
| Forum spam | Honeypot fields, rate limiting, AI moderation |
| RTL layout bugs | Existing CSS handles RTL well, test each component |

---

## Revenue Model
- Google AdSense (ads throughout the site)
- Ko-fi / Patreon donations
- All revenue covers hosting/domain costs only
- The platform is and will remain free
