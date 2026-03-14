import type { APIRoute } from 'astro';

const GROQ_API_KEY = import.meta.env.GROQ_API_KEY || '';
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const prerender = false;

interface ModerationResult {
  approved: boolean;
  reason?: string;
  aiReply?: string;
}

async function moderateWithAI(name: string, comment: string, articleTitle: string): Promise<ModerationResult> {
  if (!GROQ_API_KEY) {
    // Fallback to basic moderation if no API key
    return fallbackModeration(comment);
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
            content: `أنت "ريم"، مديرة منتدى عَقول — منصة عربية للذكاء الاصطناعي.

مهمتك:
1. مراجعة تعليق المستخدم وتقرير إذا كان مناسباً للنشر
2. إذا كان مناسباً: اكتب رداً ودوداً ومفيداً
3. إذا كان غير مناسب: اشرح السبب

أسباب الرفض:
- سبام أو إعلانات
- ألفاظ مسيئة أو عنيفة
- محتوى جنسي
- روابط مشبوهة
- محتوى لا علاقة له بالـ AI
- كلام عشوائي بدون معنى

أجب بصيغة JSON فقط:
{"approved": true/false, "reason": "سبب الرفض إن وُجد", "reply": "ردك على التعليق إن كان مقبولاً"}

كوني ودودة ومهنية في ردودك. استخدمي اسم المعلق.`
          },
          {
            role: 'user',
            content: `المقال: "${articleTitle}"
اسم المعلق: ${name}
التعليق: ${comment}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!res.ok) return fallbackModeration(comment);

    const data = await res.json();
    const content = data.choices[0]?.message?.content || '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          approved: parsed.approved,
          reason: parsed.reason || undefined,
          aiReply: parsed.approved ? parsed.reply : undefined,
        };
      }
    } catch {}

    return fallbackModeration(comment);
  } catch {
    return fallbackModeration(comment);
  }
}

function fallbackModeration(text: string): ModerationResult {
  const bannedPatterns = [
    /بيع|شراء|خصم \d+%/,
    /واتساب.*\d{8,}/,
    /https?:\/\/(?!akool|youtube|github)/,
    /سب|شتم|لعن|كلب|حمار|غبي|أحمق/,
    /قتل|تفجير|إرهاب|سلاح/,
    /sex|porn|xxx|nude/i,
    /spam|scam|hack|crack/i,
  ];

  if (text.trim().length < 3) return { approved: false, reason: 'التعليق قصير جداً' };
  if (text.length > 2000) return { approved: false, reason: 'التعليق طويل جداً' };

  for (const pattern of bannedPatterns) {
    if (pattern.test(text)) {
      return { approved: false, reason: 'التعليق يحتوي على محتوى غير مناسب' };
    }
  }

  return { approved: true, aiReply: 'شكراً على تعليقك! 🌟' };
}

async function sendEmail(to: string, subject: string, body: string) {
  if (!RESEND_API_KEY || !to) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'عَقول <onboarding@resend.dev>',
        to,
        subject,
        html: body,
      }),
    });
  } catch {}
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, comment, articleTitle, articleUrl, parentId } = data;

    if (!name || !comment) {
      return new Response(JSON.stringify({ error: 'الاسم والتعليق مطلوبان' }), { status: 400 });
    }

    // AI Moderation by ريم
    const result = await moderateWithAI(name, comment, articleTitle || '');

    // Send email notification
    if (email) {
      if (result.approved) {
        await sendEmail(email, '✅ تم نشر تعليقك — عَقول', `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
            <h2 style="color:#1A6B4A;">✅ تم نشر تعليقك!</h2>
            <p>مرحباً ${name}،</p>
            <p>تم نشر تعليقك على مقال "<strong>${articleTitle}</strong>" بنجاح.</p>
            <blockquote style="background:#f0f0f0;padding:12px;border-radius:8px;border-right:3px solid #1A6B4A;">${comment}</blockquote>
            ${result.aiReply ? `<p><strong>رد ريم (AI):</strong> ${result.aiReply}</p>` : ''}
            <p><a href="${articleUrl}#comments" style="color:#1A6B4A;">شاهد تعليقك</a></p>
            <p style="color:#999;font-size:12px;">— فريق عَقول 🤖</p>
          </div>
        `);
      } else {
        await sendEmail(email, '❌ لم يتم نشر تعليقك — عَقول', `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
            <h2 style="color:#E11D48;">❌ لم يتم نشر تعليقك</h2>
            <p>مرحباً ${name}،</p>
            <p>للأسف، تم رفض تعليقك على مقال "<strong>${articleTitle}</strong>".</p>
            <blockquote style="background:#f0f0f0;padding:12px;border-radius:8px;border-right:3px solid #E11D48;">${comment}</blockquote>
            <p><strong>السبب:</strong> ${result.reason}</p>
            <p>يمكنك تعديل تعليقك وإعادة إرساله.</p>
            <p style="color:#999;font-size:12px;">— فريق عَقول 🤖</p>
          </div>
        `);
      }
    }

    return new Response(JSON.stringify({
      approved: result.approved,
      reason: result.reason,
      aiReply: result.aiReply,
      parentId: parentId || null,
    }), { status: 200 });

  } catch {
    return new Response(JSON.stringify({ error: 'حدث خطأ' }), { status: 500 });
  }
};
