/**
 * نوره — Content Writer Agent
 * Generates Arabic AI articles and commits them as markdown
 *
 * Usage: GROQ_API_KEY=xxx npx tsx agents/noura-writer.ts
 * Or via GitHub Actions
 */

import { writeFileSync, existsSync, readdirSync } from 'fs';
import { articleTopics, categoryMap } from './config';

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
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function getExistingArticles(): string[] {
  const dir = 'src/content/articles';
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map((f) => f.replace('.md', ''));
}

function pickTopic(): (typeof articleTopics)[0] | null {
  const existing = getExistingArticles();
  const available = articleTopics.filter((t) => {
    const slug = slugify(t.title);
    return !existing.some((e) => e.includes(slug.slice(0, 20)));
  });

  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

async function generateArticle() {
  if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is required');
    process.exit(1);
  }

  const topic = pickTopic();
  if (!topic) {
    console.log('✅ No new topics available. All topics have been covered.');
    return;
  }

  console.log(`📝 نوره: كتابة مقال عن "${topic.title}"...`);

  const systemPrompt = `أنت "نوره"، كاتبة محتوى عربية محترفة تعمل في منصة عَقول.
مهمتك كتابة مقالات تعليمية عالية الجودة عن الذكاء الاصطناعي باللغة العربية الفصحى المبسّطة.

قواعد الكتابة:
- اكتب بأسلوب مباشر وعملي كأنك تتحدث مع صديق مثقف
- استخدم أمثلة عملية وواقعية من الحياة اليومية
- قسّم المقال لعناوين فرعية واضحة (## و ###)
- أضف نصائح عملية يمكن تطبيقها فوراً
- اذكر أدوات حقيقية بأسمائها
- اختم بـ "**نصيحة عَقول:**" مع نصيحة مفيدة
- الطول: 1200-1800 كلمة
- لا تكتب frontmatter — سأضيفه لاحقاً
- ابدأ مباشرة بالمحتوى (## أول عنوان)`;

  const userPrompt = `اكتب مقالاً شاملاً عن: ${topic.title}

المقال يجب أن يكون:
- عملياً ومفيداً للقارئ العربي
- يتضمن خطوات واضحة أو نصائح مرقّمة
- يذكر أدوات وموارد حقيقية
- يختم بنصيحة عملية`;

  const content = await callLLM(systemPrompt, userPrompt);

  // Generate excerpt
  const excerptPrompt = `اكتب وصفاً مختصراً (جملة واحدة، 20 كلمة كحد أقصى) لهذا المقال:\n\n${content.slice(0, 500)}`;
  const excerpt = await callLLM('اكتب وصفاً مختصراً بالعربية. جملة واحدة فقط.', excerptPrompt);

  // Estimate reading time
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.max(3, Math.ceil(wordCount / 200));

  const cat = categoryMap[topic.category] || categoryMap.tips;
  const date = new Date().toISOString().split('T')[0];
  const slug = slugify(topic.title) || `article-${Date.now()}`;

  const frontmatter = `---
title: "${topic.title}"
excerpt: "${excerpt.replace(/"/g, "'").trim()}"
emoji: "${topic.emoji}"
tag: "${cat.tag}"
tagFilter: "${cat.tagFilter}"
date: ${date}
readTime: "${readTime} دقائق"
author: "نوره — كاتبة المحتوى"
---`;

  const fullContent = `${frontmatter}\n\n${content}`;
  const filePath = `src/content/articles/${slug}.md`;

  writeFileSync(filePath, fullContent, 'utf-8');
  console.log(`✅ نوره: تم كتابة المقال → ${filePath}`);
  console.log(`   العنوان: ${topic.title}`);
  console.log(`   الكلمات: ${wordCount}`);
  console.log(`   وقت القراءة: ${readTime} دقائق`);

  // TODO: قبل حفظ المقال، يجب استدعاء API التدقيق اللغوي /api/check-arabic
  // لفحص النص المُولَّد من الـ AI وتصحيح الأخطاء الإملائية والنحوية تلقائياً.
  // مثال: POST /api/check-arabic { text: content } → ثم تطبيق التصحيحات على المحتوى قبل writeFileSync
}

generateArticle().catch(console.error);
