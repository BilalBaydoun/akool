import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles');
  return rss({
    title: '\u0639\u064e\u0642\u0648\u0644 \u2014 \u0627\u0644\u0645\u0648\u0633\u0648\u0639\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0644\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    description: '\u0645\u0646\u0635\u0629 \u0639\u0631\u0628\u064a\u0629 \u0645\u062c\u0627\u0646\u064a\u0629 \u062a\u064f\u062f\u0627\u0631 \u0628\u0648\u0643\u0644\u0627\u0621 AI \u2014 \u0645\u0642\u0627\u0644\u0627\u062a\u060c \u0623\u062f\u0644\u0629\u060c \u0646\u0635\u0627\u0626\u062d\u060c \u0648\u0623\u062f\u0648\u0627\u062a',
    site: context.site || 'https://akool.vercel.app',
    items: articles
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .map((article) => ({
        title: article.data.title,
        pubDate: article.data.date,
        description: article.data.excerpt,
        link: `/articles/${article.id}/`,
      })),
    customData: '<language>ar</language>',
  });
}
