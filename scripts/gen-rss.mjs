import fs from 'fs/promises';
import path from 'path';
import RSS from 'rss';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to normalize tags to an array of strings
function normalizeTags(tagField) {
  if (!tagField) return [];
  if (Array.isArray(tagField)) return tagField.map((t) => String(t).trim());
  if (typeof tagField === 'string') return tagField.split(',').map((t) => t.trim());
  return [];
}

async function generateRSS() {
  const feed = new RSS({
    title: 'Victor Foster',
    site_url: 'https://victorfoster.dev',
    feed_url: 'https://victorfoster.dev/feed.xml',
  });

  const postsDir = new URL('../pages/posts/', import.meta.url);
  const outputDir = new URL('../public/', import.meta.url);

  const posts = await fs.readdir(postsDir);

  await Promise.all(
    posts.map(async (fileName) => {
      if (fileName.startsWith('index.')) return;

      const filePath = new URL(fileName, postsDir);
      const content = await fs.readFile(filePath, 'utf8');
      const { data } = matter(content);

      feed.item({
        title: data.title || 'Untitled',
        url: '/posts/' + fileName.replace(/\.mdx?$/, ''),
        date: data.date || new Date().toISOString(),
        description: data.description || '',
        categories: normalizeTags(data.tag),
        author: data.author || 'Victor Foster',
      });
    })
  );

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(new URL('feed.xml', outputDir), feed.xml({ indent: true }));

  console.log('✅ RSS feed generated successfully!');
}

generateRSS().catch((err) => {
  console.error('❌ RSS generation failed:', err);
  process.exit(1);
});
