import type { APIRoute } from 'astro';

const GROQ_API_KEY = import.meta.env.GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || '';

export const prerender = false;

interface ReviewResult {
  approved: boolean;
  score: number;
  reason: string;
  summary: string;
  category: string;
}

async function reviewWithAI(title: string, url: string, type: string, description: string): Promise<ReviewResult> {
  if (!GROQ_API_KEY) {
    return fallbackReview(title, url, type);
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `أنت "دانة"، مراجعة المحتوى المجتمعي في منصة عَقول — منصة عربية للذكاء الاصطناعي.

مهمتك مراجعة محتوى مقدّم من المستخدمين وتقرير إذا كان يستحق النشر على المنصة.

معايير القبول:
- المحتوى متعلق بالذكاء الاصطناعي أو التقنية
- مفيد للجمهور العربي
- ليس سبام أو إعلان
- ليس محتوى مسيء أو مضلل
- جودة معقولة

معايير الرفض:
- لا علاقة له بالـ AI أو التقنية
- سبام أو إعلان تجاري
- محتوى مسيء أو عنيف
- روابط مشبوهة أو خطيرة
- محتوى مكرر أو منخفض الجودة

أعطِ درجة من 1-10 (7+ = موافقة).

أجب بصيغة JSON فقط:
{"approved": true/false, "score": 1-10, "reason": "سبب القرار بالعربي", "summary": "ملخص قصير للمحتوى بالعربي", "category": "news/tutorials/tips/tools"}`
          },
          {
            role: 'user',
            content: `نوع المحتوى: ${type === 'youtube' ? 'فيديو يوتيوب' : 'مقال'}
العنوان: ${title}
الرابط: ${url}
وصف المستخدم: ${description || 'لم يُقدم وصف'}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!res.ok) return fallbackReview(title, url, type);

    const data = await res.json();
    const content = data.choices[0]?.message?.content || '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          approved: parsed.approved ?? parsed.score >= 7,
          score: parsed.score || 5,
          reason: parsed.reason || '',
          summary: parsed.summary || '',
          category: parsed.category || 'tips',
        };
      }
    } catch {}

    return fallbackReview(title, url, type);
  } catch {
    return fallbackReview(title, url, type);
  }
}

function fallbackReview(title: string, url: string, type: string): ReviewResult {
  // Basic checks without AI
  const lowerTitle = title.toLowerCase();
  const aiKeywords = ['ai', 'ذكاء', 'اصطناعي', 'gpt', 'claude', 'gemini', 'llm', 'machine learning', 'deep learning', 'chatbot', 'نموذج', 'برومبت', 'prompt'];
  const hasAiKeyword = aiKeywords.some(k => lowerTitle.includes(k) || url.toLowerCase().includes(k));

  const spamPatterns = /casino|bet|porn|xxx|viagra|crypto.*earn|free.*money/i;
  const isSpam = spamPatterns.test(title) || spamPatterns.test(url);

  if (isSpam) {
    return { approved: false, score: 1, reason: 'محتوى مشبوه أو سبام', summary: '', category: 'tips' };
  }

  if (!hasAiKeyword) {
    return { approved: false, score: 4, reason: 'المحتوى لا يبدو متعلقاً بالذكاء الاصطناعي', summary: title, category: 'tips' };
  }

  return { approved: true, score: 7, reason: 'المحتوى متعلق بالـ AI وتمت الموافقة', summary: title, category: 'tips' };
}

async function sendEmail(to: string, subject: string, body: string) {
  if (!RESEND_API_KEY || !to) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'عَقول <onboarding@resend.dev>',
        to, subject,
        html: body,
      }),
    });
  } catch {}
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { title, url, type, description, userName, userEmail } = data;

    if (!title || !url) {
      return new Response(JSON.stringify({ error: 'العنوان والرابط مطلوبان' }), { status: 400 });
    }

    // دانة reviews the content
    const review = await reviewWithAI(title, url, type, description);

    // Send email to submitter
    if (userEmail) {
      if (review.approved) {
        await sendEmail(userEmail, '✅ تمت الموافقة على مشاركتك — عَقول', `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
            <h2 style="color:#1A6B4A;">✅ دانة وافقت على مشاركتك!</h2>
            <p>مرحباً ${userName || ''},</p>
            <p>تمت الموافقة على المحتوى الذي شاركته:</p>
            <p><strong>${title}</strong></p>
            <p><strong>التقييم:</strong> ${review.score}/10</p>
            <p><strong>ملاحظات دانة:</strong> ${review.reason}</p>
            <p>شكراً لمساهمتك في إثراء المحتوى العربي! 💚</p>
            <p style="color:#999;font-size:12px;">— فريق عَقول 🤖</p>
          </div>
        `);
      } else {
        await sendEmail(userEmail, '❌ لم تتم الموافقة على مشاركتك — عَقول', `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
            <h2 style="color:#E11D48;">❌ دانة لم توافق على المشاركة</h2>
            <p>مرحباً ${userName || ''},</p>
            <p>للأسف، لم تتم الموافقة على:</p>
            <p><strong>${title}</strong></p>
            <p><strong>السبب:</strong> ${review.reason}</p>
            <p><strong>التقييم:</strong> ${review.score}/10</p>
            <p>يمكنك مشاركة محتوى آخر متعلق بالذكاء الاصطناعي.</p>
            <p style="color:#999;font-size:12px;">— فريق عَقول 🤖</p>
          </div>
        `);
      }
    }

    return new Response(JSON.stringify({
      approved: review.approved,
      score: review.score,
      reason: review.reason,
      summary: review.summary,
      category: review.category,
      reviewer: 'دانة — مراجعة المحتوى',
    }), { status: 200 });

  } catch {
    return new Response(JSON.stringify({ error: 'حدث خطأ' }), { status: 500 });
  }
};
