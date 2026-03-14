/**
 * ريم — YouTube Arabic AI Content Scout
 * Searches YouTube for Arabic AI content and publishes worthy videos
 *
 * Usage: GROQ_API_KEY=xxx YOUTUBE_API_KEY=xxx npx tsx agents/reem-youtube.ts
 *
 * YouTube Data API v3 — Free: 10,000 units/day
 * Search costs 100 units per call = 100 searches/day
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const PUBLISHED_LOG = 'agents/youtube-published.json';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
}

interface PublishedEntry {
  videoId: string;
  date: string;
  title: string;
  score: number;
}

// Search queries — rotates daily
const searchQueries = [
  'الذكاء الاصطناعي شرح عربي',
  'ChatGPT بالعربي',
  'تعلم الذكاء الاصطناعي',
  'أدوات AI مجانية عربي',
  'برومبت احترافي عربي',
  'الربح من الذكاء الاصطناعي',
  'Midjourney شرح عربي',
  'Claude AI بالعربي',
  'أتمتة العمل بالذكاء الاصطناعي',
  'مستقبل الذكاء الاصطناعي عربي',
  'تطبيقات الذكاء الاصطناعي',
  'Cursor AI برمجة',
  'صناعة المحتوى بالذكاء الاصطناعي',
  'دورة ذكاء اصطناعي مجانية',
];

function getPublishedIds(): string[] {
  if (!existsSync(PUBLISHED_LOG)) return [];
  try {
    const data: PublishedEntry[] = JSON.parse(readFileSync(PUBLISHED_LOG, 'utf-8'));
    return data.map((e) => e.videoId);
  } catch {
    return [];
  }
}

function savePublished(entry: PublishedEntry) {
  let data: PublishedEntry[] = [];
  if (existsSync(PUBLISHED_LOG)) {
    try { data = JSON.parse(readFileSync(PUBLISHED_LOG, 'utf-8')); } catch {}
  }
  data.push(entry);
  // Keep last 200 entries
  if (data.length > 200) data = data.slice(-200);
  writeFileSync(PUBLISHED_LOG, JSON.stringify(data, null, 2), 'utf-8');
}

async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.log('⚠️ ريم: YOUTUBE_API_KEY غير موجود — استخدام بيانات تجريبية');
    return getDemoVideos();
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    relevanceLanguage: 'ar',
    maxResults: '10',
    order: 'date',
    publishedAfter: getWeekAgo(),
    key: YOUTUBE_API_KEY,
  });

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!res.ok) {
      console.error(`YouTube API error: ${res.status}`);
      return getDemoVideos();
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.high?.url || '',
    }));
  } catch (err) {
    console.error('YouTube search failed:', err);
    return getDemoVideos();
  }
}

function getWeekAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}

function getDemoVideos(): YouTubeVideo[] {
  return [
    {
      id: 'demo1',
      title: 'شرح ChatGPT بالعربي — دليل المبتدئين الكامل',
      description: 'في هذا الفيديو نشرح كيف تستخدم ChatGPT بشكل احترافي. نغطي أساسيات كتابة البرومبت وأفضل النصائح للحصول على نتائج ممتازة.',
      channelTitle: 'تقنية بالعربي',
      publishedAt: new Date().toISOString(),
      thumbnail: '',
    },
    {
      id: 'demo2',
      title: 'أفضل 10 أدوات ذكاء اصطناعي مجانية في 2026',
      description: 'قائمة بأفضل أدوات AI المجانية التي يمكنك استخدامها الآن لتحسين إنتاجيتك في العمل والدراسة.',
      channelTitle: 'عالم التقنية',
      publishedAt: new Date().toISOString(),
      thumbnail: '',
    },
  ];
}

async function callLLM(system: string, user: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY required');

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

interface ReviewResult {
  approved: boolean;
  score: number;
  reason: string;
  summary: string;
  category: string;
}

async function reviewVideo(video: YouTubeVideo): Promise<ReviewResult> {
  const system = `أنت "ريم"، وكيل AI مسؤول عن اكتشاف محتوى يوتيوب عربي عن الذكاء الاصطناعي لمنصة عَقول.

راجع هذا الفيديو وقرر إذا يستحق النشر على المنصة.

معايير القبول (7/10 أو أعلى):
- محتوى عربي عن AI/تقنية
- تعليمي أو إخباري أو عملي
- من قناة موثوقة (ليس سبام)
- مفيد للجمهور العربي

معايير الرفض:
- لا علاقة بالـ AI
- محتوى منخفض الجودة أو clickbait
- سبام أو إعلان مقنّع
- محتوى مكرر أو قديم

أجب بصيغة JSON فقط:
{"approved": true/false, "score": 1-10, "reason": "السبب", "summary": "ملخص الفيديو بالعربي في 2-3 جمل", "category": "news/tutorials/tips/tools"}`;

  const user = `العنوان: ${video.title}
القناة: ${video.channelTitle}
الوصف: ${video.description.slice(0, 500)}
تاريخ النشر: ${video.publishedAt}`;

  try {
    const result = await callLLM(system, user);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}

  // Fallback
  const aiWords = /ذكاء|اصطناعي|ai|gpt|claude|gemini|برومبت|prompt/i;
  const isRelevant = aiWords.test(video.title) || aiWords.test(video.description);
  return {
    approved: isRelevant,
    score: isRelevant ? 7 : 3,
    reason: isRelevant ? 'محتوى متعلق بالـ AI' : 'غير متعلق',
    summary: video.title,
    category: 'tutorials',
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

const categoryMap: Record<string, { tag: string; tagFilter: string }> = {
  news: { tag: 'أخبار AI', tagFilter: 'news' },
  tutorials: { tag: 'دروس تعليمية', tagFilter: 'tutorials' },
  tips: { tag: 'فرص وتطبيقات', tagFilter: 'tips' },
  tools: { tag: 'أدوات جديدة', tagFilter: 'tools' },
};

function createArticleFromVideo(video: YouTubeVideo, review: ReviewResult) {
  const date = new Date().toISOString().split('T')[0];
  const cat = categoryMap[review.category] || categoryMap.tutorials;
  const slug = `youtube-${slugify(video.title) || video.id}`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.id}`;

  const content = `---
title: "${video.title.replace(/"/g, "'")}"
excerpt: "${review.summary.replace(/"/g, "'")}"
emoji: "🎥"
tag: "${cat.tag}"
tagFilter: "${cat.tagFilter}"
date: ${date}
readTime: "فيديو"
author: "ريم — اكتشاف المحتوى"
---

## 🎥 فيديو مقترح من المجتمع

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:14px;margin-bottom:2rem;">
  <iframe src="https://www.youtube.com/embed/${video.id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
</div>

**القناة:** ${video.channelTitle}
**تاريخ النشر:** ${new Date(video.publishedAt).toLocaleDateString('ar-EG')}

---

## ملخص الفيديو

${review.summary}

---

## لماذا ننصح بهذا الفيديو؟

${review.reason}

**تقييم ريم:** ⭐ ${review.score}/10

---

📺 [شاهد الفيديو على يوتيوب](${youtubeUrl})

**نصيحة عَقول:** إذا وجدت فيديو مفيد عن AI بالعربي، شاركه معنا عبر [صفحة المساهمات](/submit) وسنراجعه وننشره مع ذكر اسمك!
`;

  const filePath = `src/content/articles/${slug}.md`;
  if (existsSync(filePath)) {
    console.log(`   ⏭️ المقال موجود مسبقاً: ${filePath}`);
    return false;
  }

  writeFileSync(filePath, content, 'utf-8');
  console.log(`   ✅ تم إنشاء مقال: ${filePath}`);
  return true;
}

async function main() {
  console.log('🔍 ريم: البحث عن محتوى AI عربي على يوتيوب...\n');

  if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY مطلوب');
    process.exit(1);
  }

  const publishedIds = getPublishedIds();

  // Pick today's search query
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const query = searchQueries[dayOfYear % searchQueries.length];
  console.log(`🔎 البحث عن: "${query}"\n`);

  const videos = await searchYouTube(query);
  console.log(`   وجدت ${videos.length} فيديو\n`);

  let published = 0;

  for (const video of videos) {
    // Skip already published
    if (publishedIds.includes(video.id)) {
      console.log(`   ⏭️ سبق نشره: ${video.title.slice(0, 50)}`);
      continue;
    }

    console.log(`   📺 مراجعة: ${video.title.slice(0, 60)}...`);
    const review = await reviewVideo(video);
    console.log(`      تقييم: ${review.score}/10 — ${review.approved ? '✅ مقبول' : '❌ مرفوض'} — ${review.reason.slice(0, 60)}`);

    if (review.approved && review.score >= 7) {
      const created = createArticleFromVideo(video, review);
      if (created) {
        savePublished({
          videoId: video.id,
          date: new Date().toISOString(),
          title: video.title,
          score: review.score,
        });
        published++;
      }
    }

    // Max 2 videos per run to stay within free tier limits
    if (published >= 2) break;

    // Rate limit between reviews
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n✅ ريم: تم نشر ${published} فيديو جديد`);
}

main().catch(console.error);
