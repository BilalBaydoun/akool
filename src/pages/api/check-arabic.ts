import type { APIRoute } from 'astro';

const GROQ_API_KEY = import.meta.env.GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const prerender = false;

interface GrammarError {
  original: string;
  correction: string;
  type: string;
}

interface CheckResult {
  errors: GrammarError[];
  score: number;
  summary: string;
}

async function checkWithAI(text: string): Promise<CheckResult> {
  if (!GROQ_API_KEY) {
    return fallbackCheck(text);
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
            content: `أنت مدقق لغوي عربي محترف. راجع النص التالي واكتشف الأخطاء الإملائية والنحوية. أجب بصيغة JSON: {"errors": [{"original": "الكلمة الخاطئة", "correction": "التصحيح", "type": "إملائي/نحوي/أسلوبي"}], "score": 1-10, "summary": "ملخص قصير"}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) return fallbackCheck(text);

    const data = await res.json();
    const content = data.choices[0]?.message?.content || '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          errors: parsed.errors || [],
          score: parsed.score || 5,
          summary: parsed.summary || 'تم فحص النص',
        };
      }
    } catch {}

    return fallbackCheck(text);
  } catch {
    return fallbackCheck(text);
  }
}

function fallbackCheck(text: string): CheckResult {
  const errors: GrammarError[] = [];

  // Common Arabic spelling mistakes
  const commonMistakes: [RegExp, string, string][] = [
    [/إنشاءالله/g, 'إنشاءالله', 'إن شاء الله'],
    [/انشاء الله/g, 'انشاء الله', 'إن شاء الله'],
    [/ان شاء الله/g, 'ان شاء الله', 'إن شاء الله'],
    [/الذى/g, 'الذى', 'الذي'],
    [/اللذي/g, 'اللذي', 'الذي'],
    [/هاذا/g, 'هاذا', 'هذا'],
    [/هاذه/g, 'هاذه', 'هذه'],
    [/لاكن/g, 'لاكن', 'لكن'],
    [/لاكنه/g, 'لاكنه', 'لكنه'],
    [/داءما/g, 'داءما', 'دائما'],
    [/مسائل/g, 'مسائل', 'مسائل'],
    [/شيئ\b/g, 'شيئ', 'شيء'],
    [/مسؤل/g, 'مسؤل', 'مسؤول'],
    [/إستخدام/g, 'إستخدام', 'استخدام'],
    [/إستطاع/g, 'إستطاع', 'استطاع'],
    [/إستقبال/g, 'إستقبال', 'استقبال'],
    [/إنتقال/g, 'إنتقال', 'انتقال'],
    [/إنتشار/g, 'إنتشار', 'انتشار'],
    [/إكتشاف/g, 'إكتشاف', 'اكتشاف'],
    [/إبتكار/g, 'إبتكار', 'ابتكار'],
    [/علي\b(?!\s+بن)/g, 'علي', 'على'],
    [/فى\b/g, 'فى', 'في'],
    [/إلي\b/g, 'إلي', 'إلى'],
  ];

  for (const [pattern, original, correction] of commonMistakes) {
    if (pattern.test(text)) {
      errors.push({ original, correction, type: 'إملائي' });
    }
  }

  // Check for missing spaces after punctuation
  if (/[،.؟!][^\s\n]/.test(text)) {
    errors.push({
      original: 'علامات ترقيم ملتصقة',
      correction: 'أضف مسافة بعد علامات الترقيم',
      type: 'أسلوبي',
    });
  }

  // Calculate score based on errors found
  const score = Math.max(1, 10 - errors.length);
  const summary = errors.length === 0
    ? 'لم يتم العثور على أخطاء واضحة. النص يبدو سليماً.'
    : `تم العثور على ${errors.length} ${errors.length === 1 ? 'خطأ' : 'أخطاء'} في النص.`;

  return { errors, score, summary };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { text } = data;

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'النص مطلوب' }), { status: 400 });
    }

    if (text.length > 5000) {
      return new Response(JSON.stringify({ error: 'النص طويل جداً (الحد الأقصى 5000 حرف)' }), { status: 400 });
    }

    const result = await checkWithAI(text);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'حدث خطأ' }), { status: 500 });
  }
};
