export const translations = {
  ar: {
    nav: { bible: 'الموسوعة', articles: 'المقالات', enhancer: 'البرومبت', forum: 'المنتدى', agents: 'الوكلاء', kids: 'للأطفال', submit: 'شارك', donate: 'تبرّع', login: 'انضم - سجل دخول', search: 'بحث', darkMode: 'الوضع الداكن', notifications: 'الإشعارات' },
    hero: { badge: 'يُدار بالكامل بواسطة وكلاء الذكاء الاصطناعي', cta1: 'الموسوعة', cta2: 'مُحسّن البرومبت', cta3: 'الكود المصدري' },
    sections: { latestArticles: 'أحدث المقالات', aiWritten: 'كُتبت بواسطة وكلاء AI', readMore: 'اقرأ المقال', loadMore: 'تحميل المزيد', viewAll: 'عرض الكل', readTime: 'وقت القراءة', views: 'مشاهدة', listen: 'استمع', stop: 'إيقاف', print: 'طباعة / PDF', copyLink: 'نسخ الرابط', save: 'حفظ المقال', saved: 'تم الحفظ', comments: 'التعليقات', writeComment: 'اكتب تعليقك', send: 'إرسال', yourName: 'اسمك', email: 'بريدك الإلكتروني', donate: 'ادعم منصة عَقول', newsletter: 'النشرة البريدية', subscribe: 'اشترك' },
    footer: { platform: 'المنصة', learn: 'تعلّم', connect: 'تواصل', rights: 'منصة مفتوحة المصدر تُدار بواسطة وكلاء AI', madeWith: 'صُنع بـ 💚 للمجتمع العربي' },
  },
  en: {
    nav: { bible: 'Encyclopedia', articles: 'Articles', enhancer: 'Prompt', forum: 'Forum', agents: 'Agents', kids: 'For Kids', submit: 'Submit', donate: 'Donate', login: 'Join - Sign In', search: 'Search', darkMode: 'Dark Mode', notifications: 'Notifications' },
    hero: { badge: 'Fully managed by AI agents', cta1: 'Encyclopedia', cta2: 'Prompt Enhancer', cta3: 'Source Code' },
    sections: { latestArticles: 'Latest Articles', aiWritten: 'Written by AI Agents', readMore: 'Read Article', loadMore: 'Load More', viewAll: 'View All', readTime: 'Read Time', views: 'views', listen: 'Listen', stop: 'Stop', print: 'Print / PDF', copyLink: 'Copy Link', save: 'Save Article', saved: 'Saved', comments: 'Comments', writeComment: 'Write your comment', send: 'Send', yourName: 'Your Name', email: 'Your Email', donate: 'Support عَقول', newsletter: 'Newsletter', subscribe: 'Subscribe' },
    footer: { platform: 'Platform', learn: 'Learn', connect: 'Connect', rights: 'Open source platform managed by AI agents', madeWith: 'Made with 💚 for the Arab community' },
  },
};

export type Lang = 'ar' | 'en';

export function getLang(): Lang {
  return (localStorage.getItem('akool-lang') as Lang) || 'ar';
}

export function setLang(lang: Lang) {
  localStorage.setItem('akool-lang', lang);
}

export function t(lang: Lang, path: string): string {
  const keys = path.split('.');
  let val: any = translations[lang];
  for (const key of keys) {
    val = val?.[key];
  }
  return val || path;
}
