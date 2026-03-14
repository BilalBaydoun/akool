/**
 * عَقول Developer — Platform Enhancement Agent
 * Analyzes the codebase, identifies issues, and suggests improvements
 *
 * This agent:
 * 1. Scans the codebase for issues (broken links, missing pages, accessibility)
 * 2. Checks content quality (word count, formatting, missing fields)
 * 3. Analyzes SEO (meta tags, sitemap, headings)
 * 4. Suggests new features based on platform growth
 * 5. Generates an improvement report
 *
 * Usage: GROQ_API_KEY=xxx npx tsx agents/akool-developer.ts
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REPORT_PATH = 'agents/dev-report.json';

interface Issue {
  type: 'bug' | 'seo' | 'content' | 'accessibility' | 'performance' | 'feature';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  description: string;
  suggestion: string;
}

interface DevReport {
  date: string;
  totalFiles: number;
  totalArticles: number;
  totalPages: number;
  issues: Issue[];
  score: number;
  aiSuggestions: string[];
}

function scanDirectory(dir: string, ext: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  function walk(d: string) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const path = join(d, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(path);
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        results.push(path);
      }
    }
  }
  walk(dir);
  return results;
}

function checkArticles(): Issue[] {
  const issues: Issue[] = [];
  const dir = 'src/content/articles';
  if (!existsSync(dir)) return issues;

  for (const file of readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const content = readFileSync(join(dir, file), 'utf-8');
    const filePath = join(dir, file);

    // Check frontmatter fields
    if (!content.includes('title:')) {
      issues.push({ type: 'content', severity: 'critical', file: filePath, description: 'مقال بدون عنوان', suggestion: 'أضف حقل title في frontmatter' });
    }
    if (!content.includes('excerpt:')) {
      issues.push({ type: 'seo', severity: 'high', file: filePath, description: 'مقال بدون وصف مختصر', suggestion: 'أضف حقل excerpt للـ SEO' });
    }
    if (!content.includes('author:')) {
      issues.push({ type: 'content', severity: 'medium', file: filePath, description: 'مقال بدون اسم كاتب', suggestion: 'أضف حقل author' });
    }

    // Check content length
    const bodyStart = content.indexOf('---', content.indexOf('---') + 3);
    const body = bodyStart > 0 ? content.slice(bodyStart + 3) : '';
    const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;

    if (wordCount < 200) {
      issues.push({ type: 'content', severity: 'high', file: filePath, description: `مقال قصير جداً (${wordCount} كلمة)`, suggestion: 'المقال يجب أن يكون 500 كلمة على الأقل' });
    }

    // Check for h2 headings
    if (!body.includes('## ')) {
      issues.push({ type: 'content', severity: 'medium', file: filePath, description: 'مقال بدون عناوين فرعية', suggestion: 'أضف عناوين ## لتحسين القراءة' });
    }
  }

  return issues;
}

function checkPages(): Issue[] {
  const issues: Issue[] = [];
  const pages = scanDirectory('src/pages', '.astro');

  for (const page of pages) {
    const content = readFileSync(page, 'utf-8');

    // Check for Navbar
    if (!content.includes('Navbar') && !page.includes('api/') && !page.includes('rss')) {
      issues.push({ type: 'bug', severity: 'high', file: page, description: 'صفحة بدون Navbar', suggestion: 'أضف import واستخدام Navbar' });
    }

    // Check for Footer
    if (!content.includes('Footer') && !page.includes('api/') && !page.includes('rss') && !page.includes('404')) {
      issues.push({ type: 'bug', severity: 'medium', file: page, description: 'صفحة بدون Footer', suggestion: 'أضف import واستخدام Footer' });
    }

    // Check for SearchModal
    if (!content.includes('SearchModal') && !page.includes('api/') && !page.includes('rss')) {
      issues.push({ type: 'accessibility', severity: 'low', file: page, description: 'صفحة بدون بحث', suggestion: 'أضف SearchModal للوصول السريع' });
    }

    // Check for BaseLayout title
    if (content.includes('BaseLayout') && !content.includes('title=')) {
      issues.push({ type: 'seo', severity: 'medium', file: page, description: 'صفحة بدون عنوان مخصص', suggestion: 'أضف title prop لـ BaseLayout' });
    }
  }

  return issues;
}

function checkCSS(): Issue[] {
  const issues: Issue[] = [];
  const cssPath = 'src/styles/global.css';
  if (!existsSync(cssPath)) return issues;

  const css = readFileSync(cssPath, 'utf-8');

  // Check for dark mode coverage
  const darkSelectors = (css.match(/\[data-theme="dark"\]/g) || []).length;
  if (darkSelectors < 5) {
    issues.push({ type: 'accessibility', severity: 'medium', file: cssPath, description: 'تغطية الوضع الداكن محدودة', suggestion: 'أضف المزيد من أنماط dark mode' });
  }

  // Check for responsive breakpoints
  const mediaQueries = (css.match(/@media/g) || []).length;
  if (mediaQueries < 3) {
    issues.push({ type: 'accessibility', severity: 'medium', file: cssPath, description: 'breakpoints قليلة للاستجابة', suggestion: 'أضف المزيد من media queries' });
  }

  return issues;
}

function checkAgents(): Issue[] {
  const issues: Issue[] = [];
  const agentDir = 'agents';
  if (!existsSync(agentDir)) return issues;

  const agents = readdirSync(agentDir).filter(f => f.endsWith('.ts'));

  for (const agent of agents) {
    const content = readFileSync(join(agentDir, agent), 'utf-8');

    // Check for error handling
    if (!content.includes('catch') && !content.includes('try')) {
      issues.push({ type: 'bug', severity: 'medium', file: join(agentDir, agent), description: 'وكيل بدون معالجة أخطاء', suggestion: 'أضف try/catch للعمليات الخارجية' });
    }
  }

  return issues;
}

async function getAISuggestions(report: Partial<DevReport>): Promise<string[]> {
  if (!GROQ_API_KEY) return ['لا يمكن توليد اقتراحات بدون GROQ_API_KEY'];

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `أنت مطور ويب خبير ومحلل تقني. حلل تقرير المنصة واقترح 5 تحسينات عملية.
أجب بصيغة JSON: ["اقتراح 1", "اقتراح 2", ...]
الاقتراحات يجب أن تكون عملية ومحددة وقابلة للتنفيذ.`,
          },
          {
            role: 'user',
            content: `تقرير منصة عَقول:
- عدد الملفات: ${report.totalFiles}
- عدد المقالات: ${report.totalArticles}
- عدد الصفحات: ${report.totalPages}
- عدد المشاكل: ${report.issues?.length}
- المشاكل الحرجة: ${report.issues?.filter(i => i.severity === 'critical').length}
- التقييم: ${report.score}/100

أهم المشاكل:
${report.issues?.slice(0, 10).map(i => `- [${i.severity}] ${i.description} (${i.file})`).join('\n')}

اقترح 5 تحسينات:`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const content = data.choices[0]?.message?.content || '';
    const match = content.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch {}

  return [];
}

async function main() {
  console.log('🔧 عَقول Developer: بدء فحص المنصة...\n');

  const issues: Issue[] = [];

  // 1. Check articles
  console.log('📝 فحص المقالات...');
  const articleIssues = checkArticles();
  issues.push(...articleIssues);
  console.log(`   وجدت ${articleIssues.length} ملاحظة`);

  // 2. Check pages
  console.log('📄 فحص الصفحات...');
  const pageIssues = checkPages();
  issues.push(...pageIssues);
  console.log(`   وجدت ${pageIssues.length} ملاحظة`);

  // 3. Check CSS
  console.log('🎨 فحص الأنماط...');
  const cssIssues = checkCSS();
  issues.push(...cssIssues);
  console.log(`   وجدت ${cssIssues.length} ملاحظة`);

  // 4. Check agents
  console.log('🤖 فحص الوكلاء...');
  const agentIssues = checkAgents();
  issues.push(...agentIssues);
  console.log(`   وجدت ${agentIssues.length} ملاحظة`);

  // Count files
  const totalFiles = scanDirectory('src', '.astro').length + scanDirectory('src', '.ts').length + scanDirectory('src', '.css').length;
  const totalArticles = existsSync('src/content/articles') ? readdirSync('src/content/articles').filter(f => f.endsWith('.md')).length : 0;
  const totalPages = scanDirectory('src/pages', '.astro').length;

  // Calculate score
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;
  const score = Math.max(0, 100 - (criticalCount * 15) - (highCount * 8) - (mediumCount * 3));

  const report: DevReport = {
    date: new Date().toISOString(),
    totalFiles,
    totalArticles,
    totalPages,
    issues,
    score,
    aiSuggestions: [],
  };

  // 5. Get AI suggestions
  console.log('\n🧠 توليد اقتراحات AI...');
  report.aiSuggestions = await getAISuggestions(report);

  // Save report
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

  // Print summary
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 تقرير المطوّر — عَقول`);
  console.log('═'.repeat(50));
  console.log(`📁 الملفات: ${totalFiles}`);
  console.log(`📝 المقالات: ${totalArticles}`);
  console.log(`📄 الصفحات: ${totalPages}`);
  console.log(`⚠️  الملاحظات: ${issues.length}`);
  console.log(`   🔴 حرجة: ${criticalCount}`);
  console.log(`   🟠 عالية: ${highCount}`);
  console.log(`   🟡 متوسطة: ${mediumCount}`);
  console.log(`   🟢 منخفضة: ${issues.filter(i => i.severity === 'low').length}`);
  console.log(`\n⭐ التقييم: ${score}/100`);

  if (report.aiSuggestions.length > 0) {
    console.log('\n💡 اقتراحات التحسين:');
    report.aiSuggestions.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
  }

  console.log('\n✅ التقرير محفوظ في: ' + REPORT_PATH);
}

main().catch(console.error);
