import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nunjucks from 'nunjucks';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(root, 'src');
const templatesDir = resolve(srcDir, 'templates');
const componentsDir = resolve(srcDir, 'components');
const sectionsDir = resolve(srcDir, 'sections');
const dataDir = resolve(srcDir, 'data');

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function htmlTemplates() {
  const nunjucksEnv = new nunjucks.Environment(
    new nunjucks.FileSystemLoader([templatesDir, srcDir], { noCache: true }),
    { autoescape: true, noCache: true },
  );

  return {
    name: 'nunjucks-html',
    configureServer(server) {
      const watchedDirs = [templatesDir, componentsDir, sectionsDir, dataDir];
      server.watcher.add(watchedDirs);
      server.watcher.on('all', (_event, file) => {
        if (watchedDirs.some((dir) => file.startsWith(`${dir}/`)) && /\.(njk|json)$/.test(file)) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const pageDataFile = resolve(dataDir, 'pages', relative(root, context.filename).replace(/\.html$/, '.json'));
        const page = readJson(pageDataFile);
        if (page.activePage === 'all-pages') {
          page.directory.pages = pages(root).map((file) => {
            const item = readJson(resolve(dataDir, 'pages', file.replace(/\.html$/, '.json')));
            return {
              title: item.title,
              group: item.directoryGroup ?? 'main',
              href: `/${file}`,
              current: file === relative(root, context.filename),
            };
          }).sort((a, b) => {
            if (a.href === '/index.html') return -1;
            if (b.href === '/index.html') return 1;
            return a.title.localeCompare(b.title, 'ru');
          });
          page.directory.groups = page.directory.groups.map((group) => ({
            ...group,
            pages: page.directory.pages.filter((item) => item.group === group.id),
          }));
        }
        return nunjucksEnv.renderString(html, {
          site: readJson(resolve(dataDir, 'site.json')),
          page,
          currentYear: new Date().getFullYear(),
        });
      },
    },
  };
}

function pages(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'src' || entry.name === 'public') return [];
    const relativePath = join(prefix, entry.name);
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return pages(fullPath, relativePath);
    return entry.isFile() && entry.name.endsWith('.html') ? [relativePath] : [];
  });
}

const input = Object.fromEntries(
  pages(root).map((page) => [page, resolve(root, page)]),
);

export default defineConfig({
  plugins: [htmlTemplates()],
  build: {
    rolldownOptions: { input },
  },
});
