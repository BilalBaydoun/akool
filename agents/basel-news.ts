/**
 * باسل — News Curator Agent
 * Fetches AI news and updates the ticker + writes news articles
 *
 * Usage: GROQ_API_KEY=xxx npx tsx agents/basel-news.ts
 */

import { writeFileSync, readFileSync } from 'fs';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

async function updateNewsTicker() {
  console.log('📰 باسل: تحديث شريط الأخبار...');

  const systemPrompt = `أنت "باسل"، محلل أخبار AI عربي في منصة عَقول.
مهمتك توليد 5 عناوين أخبار قصيرة ومحدّثة عن الذكاء الاصطناعي.

القواعد:
- كل خبر في سطر واحد
- ابدأ كل خبر بإيموجي مناسب
- اجعلها واقعية ومحدّثة (2026)
- بالعربية الفصحى المبسّطة
- لا ترقّم الأخبار
- اكتب 5 أخبار فقط، كل خبر في سطر منفصل`;

  const userPrompt = `اكتب 5 عناوين أخبار AI قصيرة وجذابة لشريط الأخبار. التاريخ: ${new Date().toISOString().split('T')[0]}`;

  const result = await callLLM(systemPrompt, userPrompt);
  const newsItems = result
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 10)
    .slice(0, 5);

  if (newsItems.length === 0) {
    console.log('⚠️ باسل: لم يتم توليد أخبار');
    return;
  }

  // Update NewsTicker component
  const tickerPath = 'src/components/NewsTicker.astro';
  const itemsStr = newsItems.map((item) => `  '${item.replace(/'/g, "\\'")}',`).join('\n');

  const tickerContent = `---
const newsItems = [
${itemsStr}
];
---

<div class="news-ticker">
  <div class="ticker-label">🔴 عاجل</div>
  <div class="ticker-track">
    <div class="ticker-inner">
      {newsItems.map((item) => <span>{item}</span>)}
      {newsItems.map((item) => <span>{item}</span>)}
    </div>
  </div>
</div>
`;

  writeFileSync(tickerPath, tickerContent, 'utf-8');
  console.log(`✅ باسل: تم تحديث ${newsItems.length} أخبار في الشريط`);
  newsItems.forEach((n) => console.log(`   ${n}`));
}

async function writeNewsArticle() {
  console.log('📝 باسل: كتابة مقال أخبار...');

  const systemPrompt = `أنت "باسل"، محلل أخبار AI عربي.
اكتب مقالاً إخبارياً تحليلياً عن آخر تطورات الذكاء الاصطناعي.

القواعد:
- أسلوب صحفي تحليلي
- 800-1200 كلمة
- عناوين فرعية واضحة
- تحليل التأثير على المستخدم العربي
- اختم بـ "**نصيحة عَقول:**"
- لا تكتب frontmatter`;

  const userPrompt = `اكتب مقالاً تحليلياً عن أحدث تطورات AI في ${new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}. ركّز على ما يهم المستخدم العربي.`;

  const content = await callLLM(systemPrompt, userPrompt);
  const date = new Date().toISOString().split('T')[0];
  const slug = `ai-news-${date}`;

  const frontmatter = `---
title: "أبرز أخبار الذكاء الاصطناعي — ${new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}"
excerpt: "ملخص تحليلي لأهم تطورات AI هذا الأسبوع وتأثيرها على المستخدم العربي."
emoji: "📰"
tag: "أخبار AI"
tagFilter: "news"
date: ${date}
readTime: "5 دقائق"
author: "باسل — محلل الأخبار"
---`;

  writeFileSync(`src/content/articles/${slug}.md`, `${frontmatter}\n\n${content}`, 'utf-8');
  console.log(`✅ باسل: تم كتابة مقال الأخبار → src/content/articles/${slug}.md`);
}

async function main() {
  if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is required');
    process.exit(1);
  }

  await updateNewsTicker();
  await writeNewsArticle();
}

main().catch(console.error);
