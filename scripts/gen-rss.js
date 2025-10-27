import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import RSS from 'rss';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
  const feed = new RSS({
    title: 'Victor Foster',
    site_url: 'https://victorfoster.dev',
    feed_url: 'https://victorfoster.dev/feed.xml',
  });

  const postsDir = path.join(__dirname, '..', 'pages', 'posts');
  const posts = await fs.readdir(postsDir);

  await Promise.all(
    posts.map(async (name) => {
      if (name.startsWith('index.')) return;

      const filePath = path.join(postsDir, name);
      const content = await fs.readFile(filePath, 'utf8');
      const { data } = matter(content);

      feed.item({
        title: data.title,
        url: '/posts/' + name.replace(/\.mdx?$/, ''),
        date: data.date,
        description: data.description,
        categories: (data.tag || '').split(',').map((t) => t.trim()),
        author: data.author,
      });
    }),
  );

  const outputDir = path.join(__dirname, '..', 'public');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'feed.xml'), feed.xml({ indent: true }));
  console.log('✅ RSS feed generated successfully!');
}

generate().catch((err) => {
  console.error('❌ RSS generation failed:', err);
  process.exit(1);
});
