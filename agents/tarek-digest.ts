/**
 * طارق — Weekly Digest Agent
 * Generates a weekly summary of best content and sends to subscribers
 *
 * Usage: GROQ_API_KEY=xxx RESEND_API_KEY=xxx npx tsx agents/tarek-digest.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callLLM(system: string, user: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.5, max_tokens: 2000,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

function getRecentArticles(): Array<{ title: string; excerpt: string; slug: string; date: string }> {
  const dir = 'src/content/articles';
  if (!existsSync(dir)) return [];
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = readFileSync(`${dir}/${f}`, 'utf-8');
      const titleMatch = content.match(/title:\s*"([^"]+)"/);
      const excerptMatch = content.match(/excerpt:\s*"([^"]+)"/);
      const dateMatch = content.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
      return {
        title: titleMatch?.[1] || f,
        excerpt: excerptMatch?.[1] || '',
        slug: f.replace('.md', ''),
        date: dateMatch?.[1] || '',
      };
    })
    .filter(a => {
      if (!a.date) return false;
      return new Date(a.date).getTime() > weekAgo;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

async function generateDigest() {
  if (!GROQ_API_KEY) { console.error('❌ GROQ_API_KEY required'); process.exit(1); }

  console.log('📈 طارق: إنشاء النشرة الأسبوعية...');

  const articles = getRecentArticles();
  if (articles.length === 0) {
    console.log('⚠️ طارق: لا توجد مقالات جديدة هذا الأسبوع');
    return;
  }

  const articleList = articles.map((a, i) => `${i + 1}. ${a.title}: ${a.excerpt}`).join('\n');

  const system = `أنت "طارق"، مسوّق منصة عَقول. اكتب نشرة بريدية أسبوعية جذابة بالعربية.
اكتب بأسلوب ودّي ومهني. ضمّن: ترحيب قصير، ملخص أهم المقالات، نصيحة الأسبوع، ودعوة للمشاركة.
اكتب بصيغة HTML بسيطة (h2, p, ul, li, a, strong). استخدم dir="rtl".`;

  const user = `مقالات هذا الأسبوع:\n${articleList}\n\nاكتب النشرة الأسبوعية:`;

  const htmlContent = await callLLM(system, user);

  console.log('✅ طارق: تم إنشاء النشرة الأسبوعية');
  console.log(`   المقالات: ${articles.length}`);

  // In production: send via Resend to subscriber list
  if (RESEND_API_KEY) {
    console.log('📧 طارق: إرسال النشرة عبر Resend...');
    // Would send to subscriber list from Supabase
    console.log('⚠️ طارق: قائمة المشتركين تحتاج Supabase — سيتم التفعيل لاحقاً');
  }

  // Save digest for reference
  const digestPath = `agents/digest-${new Date().toISOString().split('T')[0]}.html`;
  const { writeFileSync } = await import('fs');
  writeFileSync(digestPath, htmlContent, 'utf-8');
  console.log(`   حُفظت في: ${digestPath}`);
}

generateDigest().catch(console.error);
