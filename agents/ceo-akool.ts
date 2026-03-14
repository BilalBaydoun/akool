/**
 * عَقول — CEO Agent
 * The master orchestrator that manages all other agents
 *
 * Powers:
 * - Monitor agent performance
 * - Enable/disable agents (hire/fire)
 * - Reassign tasks between agents
 * - Generate weekly performance report
 * - Update agent stats on the website
 *
 * Usage: GROQ_API_KEY=xxx npx tsx agents/ceo-akool.ts
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { agentTeam, type AgentConfig } from './config';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const LOG_PATH = 'agents/ceo-log.json';

interface CeoDecision {
  date: string;
  agent: string;
  action: 'hire' | 'fire' | 'reassign' | 'promote' | 'demote' | 'praise' | 'warning';
  reason: string;
}

interface CeoLog {
  lastRun: string;
  totalDecisions: number;
  decisions: CeoDecision[];
  weeklyReport: string | null;
}

function loadLog(): CeoLog {
  if (existsSync(LOG_PATH)) {
    return JSON.parse(readFileSync(LOG_PATH, 'utf-8'));
  }
  return { lastRun: '', totalDecisions: 0, decisions: [], weeklyReport: null };
}

function saveLog(log: CeoLog) {
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf-8');
}

function countArticles(): number {
  const dir = 'src/content/articles';
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => f.endsWith('.md')).length;
}

function countFoundations(): number {
  const dir = 'src/content/foundations';
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => f.endsWith('.md')).length;
}

function getAgentArticleCount(agentName: string): number {
  const dir = 'src/content/articles';
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const content = readFileSync(`${dir}/${file}`, 'utf-8');
    if (content.includes(`author: "${agentName}`)) count++;
  }
  return count;
}

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
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

async function evaluateTeam(log: CeoLog): Promise<CeoDecision[]> {
  const totalArticles = countArticles();
  const totalFoundations = countFoundations();

  const nouraArticles = getAgentArticleCount('نوره');
  const baselArticles = getAgentArticleCount('باسل');
  const tarekArticles = getAgentArticleCount('طارق');

  const teamStatus = agentTeam.map((a) => {
    let output = '';
    if (a.id === 'noura') output = `${nouraArticles} مقال مكتوب`;
    else if (a.id === 'basel') output = `${baselArticles} مقال أخبار + شريط أخبار`;
    else if (a.id === 'reem') output = 'ردود المنتدى (تحتاج Supabase)';
    else if (a.id === 'tarek') output = `${tarekArticles} مقال + SEO`;
    else if (a.id === 'dana') output = 'مراجعة المحتوى (تحتاج Supabase)';
    return `- ${a.name} (${a.nameEn}): ${a.role} | حالة: ${a.active ? 'نشط' : 'موقف'} | الإنتاج: ${output}`;
  }).join('\n');

  const systemPrompt = `أنت "عَقول"، المدير التنفيذي (CEO) لمنصة عَقول.
مهمتك تقييم أداء فريق الوكلاء واتخاذ قرارات.

القرارات المتاحة لك:
- praise: إشادة بوكيل ممتاز
- warning: تحذير وكيل ضعيف
- reassign: نقل مهمة بين وكلاء
- promote: ترقية وكيل
- demote: تقليص مهام وكيل
- hire: اقتراح توظيف وكيل جديد
- fire: إيقاف وكيل (فقط في حالات الفشل المتكرر)

أجب بصيغة JSON فقط — مصفوفة من القرارات:
[{"agent": "اسم الوكيل", "action": "نوع القرار", "reason": "السبب بالعربي"}]

كن عادلاً ومنطقياً. لا تتخذ قرارات fire إلا إذا كان الوكيل فاشلاً تماماً.
إذا كان الأداء جيداً، استخدم praise.`;

  const userPrompt = `تقرير الفريق:

إجمالي المقالات: ${totalArticles}
إجمالي الأدلة: ${totalFoundations}

حالة الوكلاء:
${teamStatus}

عدد القرارات السابقة: ${log.totalDecisions}
آخر تشغيل: ${log.lastRun || 'أول مرة'}

قيّم الفريق واتخذ قراراتك:`;

  const result = await callLLM(systemPrompt, userPrompt);

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    console.log('⚠️ عَقول: لم يتمكن من تحليل القرارات');
  }

  return [];
}

async function generateWeeklyReport(log: CeoLog): Promise<string> {
  const totalArticles = countArticles();
  const recentDecisions = log.decisions.slice(-10);

  const systemPrompt = `أنت "عَقول"، CEO منصة عَقول. اكتب تقريراً أسبوعياً مختصراً (5-8 أسطر) بالعربية عن حالة المنصة والفريق.`;

  const userPrompt = `الإحصائيات:
- إجمالي المقالات: ${totalArticles}
- إجمالي القرارات: ${log.totalDecisions}
- آخر القرارات: ${JSON.stringify(recentDecisions.slice(-5))}

اكتب تقريراً أسبوعياً مختصراً:`;

  return await callLLM(systemPrompt, userPrompt);
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const OWNER_EMAIL = process.env.OWNER_EMAIL || '';

async function sendDailyReport(log: CeoLog, todayDecisions: CeoDecision[]) {
  if (!RESEND_API_KEY || !OWNER_EMAIL) {
    console.log('\n📧 تخطي إرسال البريد (RESEND_API_KEY أو OWNER_EMAIL غير موجود)');
    return;
  }

  const totalArticles = countArticles();
  const totalFoundations = countFoundations();
  const nouraArticles = getAgentArticleCount('نوره');
  const baselArticles = getAgentArticleCount('باسل');

  // Check if dev report exists
  let devScore = '—';
  let devIssues = '—';
  try {
    if (existsSync('agents/dev-report.json')) {
      const devReport = JSON.parse(readFileSync('agents/dev-report.json', 'utf-8'));
      devScore = `${devReport.score}/100`;
      devIssues = `${devReport.issues?.length || 0} ملاحظة`;
    }
  } catch {}

  // Check YouTube published
  let ytCount = 0;
  try {
    if (existsSync('agents/youtube-published.json')) {
      const ytData = JSON.parse(readFileSync('agents/youtube-published.json', 'utf-8'));
      ytCount = ytData.length;
    }
  } catch {}

  const decisionsHtml = todayDecisions.length > 0
    ? todayDecisions.map(d => {
        const emoji = d.action === 'praise' ? '⭐' : d.action === 'warning' ? '⚠️' : d.action === 'fire' ? '❌' : d.action === 'hire' ? '✅' : '📌';
        return `<li>${emoji} <strong>${d.agent}</strong>: ${d.action} — ${d.reason}</li>`;
      }).join('')
    : '<li>لا توجد قرارات جديدة اليوم</li>';

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f7f4;padding:24px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#1A6B4A,#145238);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:1.2rem;font-weight:900;">عَ</div>
        <h1 style="font-size:1.3rem;margin:8px 0 4px;">📊 التقرير اليومي — عَقول</h1>
        <p style="color:#6B6860;font-size:0.85rem;">${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;">
        <h2 style="font-size:1rem;margin-bottom:12px;">📈 إحصائيات المنصة</h2>
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">إجمالي المقالات</td><td style="font-weight:700;color:#1A6B4A;">${totalArticles}</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">أدلة الموسوعة</td><td style="font-weight:700;color:#1A6B4A;">${totalFoundations}</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">فيديوهات يوتيوب</td><td style="font-weight:700;color:#1A6B4A;">${ytCount}</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">تقييم المنصة</td><td style="font-weight:700;color:#1A6B4A;">${devScore}</td></tr>
          <tr><td style="padding:6px 0;">ملاحظات تقنية</td><td style="font-weight:700;">${devIssues}</td></tr>
        </table>
      </div>

      <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;">
        <h2 style="font-size:1rem;margin-bottom:12px;">🤖 أداء الوكلاء</h2>
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">👨‍💼 عَقول (CEO)</td><td>${log.totalDecisions} قرار</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">👩‍💻 نوره (محتوى)</td><td>${nouraArticles} مقال</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">👨‍💼 باسل (أخبار)</td><td>${baselArticles} مقال</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">👩‍🏫 ريم (يوتيوب)</td><td>${ytCount} فيديو</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">👨‍🎨 طارق (تسويق)</td><td>نشرة أسبوعية</td></tr>
          <tr><td style="padding:6px 0;">👩‍⚖️ دانة (مراجعة)</td><td>مراجعة تلقائية</td></tr>
        </table>
      </div>

      <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;">
        <h2 style="font-size:1rem;margin-bottom:12px;">📋 قرارات اليوم</h2>
        <ul style="padding:0 16px;font-size:0.9rem;line-height:1.8;">${decisionsHtml}</ul>
      </div>

      ${log.weeklyReport ? `
      <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;">
        <h2 style="font-size:1rem;margin-bottom:12px;">📝 التقرير الأسبوعي</h2>
        <p style="font-size:0.9rem;line-height:1.7;color:#3D3B35;">${log.weeklyReport}</p>
      </div>
      ` : ''}

      <p style="text-align:center;color:#9B9890;font-size:0.78rem;margin-top:20px;">
        هذا التقرير مُولّد تلقائياً بواسطة عَقول CEO Agent 🤖
      </p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'عَقول CEO <akool@bilalbaydoun.me>',
        to: OWNER_EMAIL,
        subject: `📊 تقرير عَقول اليومي — ${totalArticles} مقال، ${todayDecisions.length} قرار`,
        html,
      }),
    });

    if (res.ok) {
      console.log(`\n📧 تم إرسال التقرير اليومي إلى ${OWNER_EMAIL}`);
    } else {
      console.log(`\n⚠️ فشل إرسال البريد: ${res.status}`);
    }
  } catch (err) {
    console.log(`\n⚠️ خطأ في إرسال البريد: ${err}`);
  }
}

function updateAgentPageStats(log: CeoLog) {
  const nouraArticles = getAgentArticleCount('نوره');
  const baselArticles = getAgentArticleCount('باسل');
  const totalArticles = countArticles();
  const totalFoundations = countFoundations();

  // Update the stats in agents page data
  console.log('\n📊 إحصائيات الفريق:');
  console.log(`   عَقول (CEO): ${agentTeam.filter(a => a.active).length} وكلاء نشطين, ${log.totalDecisions} قرار`);
  console.log(`   نوره: ${nouraArticles} مقال, ${totalFoundations} دليل`);
  console.log(`   باسل: ${baselArticles} مقال أخبار`);
  console.log(`   المجموع: ${totalArticles} مقال + ${totalFoundations} دليل`);
}

async function main() {
  console.log('👨‍💼 عَقول (CEO): بدء جولة الإشراف...\n');

  if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY مطلوب');
    process.exit(1);
  }

  const log = loadLog();

  // 1. Evaluate team
  console.log('📋 تقييم أداء الفريق...');
  const decisions = await evaluateTeam(log);

  for (const decision of decisions) {
    const emoji =
      decision.action === 'praise' ? '⭐' :
      decision.action === 'warning' ? '⚠️' :
      decision.action === 'fire' ? '❌' :
      decision.action === 'hire' ? '✅' :
      decision.action === 'reassign' ? '🔄' :
      decision.action === 'promote' ? '⬆️' :
      decision.action === 'demote' ? '⬇️' : '📌';

    console.log(`   ${emoji} ${decision.agent}: ${decision.action} — ${decision.reason}`);

    log.decisions.push({
      date: new Date().toISOString(),
      ...decision,
    });
    log.totalDecisions++;
  }

  // 2. Generate weekly report (on Sundays or first run)
  const isFirstRun = !log.lastRun;
  const isSunday = new Date().getDay() === 0;
  if (isFirstRun || isSunday) {
    console.log('\n📝 إنشاء التقرير الأسبوعي...');
    log.weeklyReport = await generateWeeklyReport(log);
    console.log(`   ${log.weeklyReport}`);
  }

  // 3. Update stats
  updateAgentPageStats(log);

  // 4. Gather all agent logs and send daily email to owner
  await sendDailyReport(log, decisions);

  // 5. Save log
  log.lastRun = new Date().toISOString();
  if (log.decisions.length > 100) {
    log.decisions = log.decisions.slice(-100);
  }
  saveLog(log);

  console.log('\n✅ عَقول (CEO): جولة الإشراف اكتملت');
}

main().catch(console.error);
