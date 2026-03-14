// Agent Configuration
// The CEO reads this to manage the team

export interface AgentConfig {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  active: boolean;
  schedule: string; // cron expression
  lastRun: string | null;
  tasksCompleted: number;
  performance: 'excellent' | 'good' | 'needs-improvement' | 'new';
}

export const agentTeam: AgentConfig[] = [
  {
    id: 'noura',
    name: 'نوره',
    nameEn: 'Noura',
    role: 'content-writer',
    active: true,
    schedule: '0 8 * * *', // Daily at 8 AM UTC
    lastRun: null,
    tasksCompleted: 0,
    performance: 'new',
  },
  {
    id: 'basel',
    name: 'باسل',
    nameEn: 'Basel',
    role: 'news-curator',
    active: true,
    schedule: '0 6 * * *', // Daily at 6 AM UTC
    lastRun: null,
    tasksCompleted: 0,
    performance: 'new',
  },
  {
    id: 'reem',
    name: 'ريم',
    nameEn: 'Reem',
    role: 'forum-responder',
    active: true,
    schedule: '*/30 * * * *', // Every 30 minutes
    lastRun: null,
    tasksCompleted: 0,
    performance: 'new',
  },
  {
    id: 'tarek',
    name: 'طارق',
    nameEn: 'Tarek',
    role: 'marketing',
    active: true,
    schedule: '0 10 * * 1', // Weekly Monday at 10 AM
    lastRun: null,
    tasksCompleted: 0,
    performance: 'new',
  },
  {
    id: 'dana',
    name: 'دانة',
    nameEn: 'Dana',
    role: 'content-reviewer',
    active: true,
    schedule: '0 */4 * * *', // Every 4 hours
    lastRun: null,
    tasksCompleted: 0,
    performance: 'new',
  },
];

// Topics pool for content generation
export const articleTopics = [
  { title: 'كيف تستخدم AI في إدارة مشاريعك', category: 'tips', emoji: '📋' },
  { title: 'مقارنة بين أفضل نماذج AI المجانية', category: 'tools', emoji: '⚖️' },
  { title: 'أتمتة المهام المكررة باستخدام AI', category: 'tutorials', emoji: '🔄' },
  { title: 'كيف تحمي خصوصيتك عند استخدام AI', category: 'tutorials', emoji: '🔒' },
  { title: 'بناء شات بوت ذكي بدون برمجة', category: 'tutorials', emoji: '🤖' },
  { title: 'أفضل طرق تعلّم AI للمبتدئين', category: 'tips', emoji: '🎓' },
  { title: 'كيف يغيّر AI صناعة التعليم العربي', category: 'news', emoji: '📚' },
  { title: 'أدوات AI لتحسين الإنتاجية في العمل عن بعد', category: 'tools', emoji: '🏠' },
  { title: 'مستقبل AI في المنطقة العربية', category: 'news', emoji: '🌍' },
  { title: 'كيف تبني محفظة أعمال باستخدام AI', category: 'tips', emoji: '💼' },
  { title: 'شرح تقنية RAG وكيف تستفيد منها', category: 'tutorials', emoji: '🔗' },
  { title: 'أفضل بدائل ChatGPT المجانية', category: 'tools', emoji: '💬' },
  { title: 'كيف تستخدم AI في التصميم الجرافيكي', category: 'tutorials', emoji: '🎨' },
  { title: 'نصائح لكتابة سيرة ذاتية بـ AI', category: 'tips', emoji: '📄' },
  { title: 'AI والتجارة الإلكترونية: دليل شامل', category: 'tutorials', emoji: '🛒' },
];

export const categoryMap: Record<string, { tag: string; tagFilter: string }> = {
  news: { tag: 'أخبار AI', tagFilter: 'news' },
  tutorials: { tag: 'دروس تعليمية', tagFilter: 'tutorials' },
  tips: { tag: 'فرص وتطبيقات', tagFilter: 'tips' },
  tools: { tag: 'أدوات جديدة', tagFilter: 'tools' },
};
