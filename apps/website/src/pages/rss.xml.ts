import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');
  const sortedPosts = blog.sort(
    (a, b) => new Date(b.data.datum).getTime() - new Date(a.data.datum).getTime()
  );

  return rss({
    title: 'procurement-ai Blog',
    description:
      'Neuigkeiten und Fachartikel rund um KI-gestützte Beschaffung, Vergaberecht und digitale Verwaltung.',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.titel,
      description: post.data.beschreibung,
      pubDate: new Date(post.data.datum),
      link: `/blog/${post.id}`,
      author: post.data.autor,
      categories: post.data.tags,
    })),
    customData: '<language>de-DE</language>',
  });
}
