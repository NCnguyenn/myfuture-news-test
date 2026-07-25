import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');

function read(relativePath: string): string {
  return readFileSync(path.join(workspaceRoot, relativePath), 'utf8');
}

function readOptional(relativePath: string): string {
  const absolutePath = path.join(workspaceRoot, relativePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function findCssFiles(relativeDirectory: string): string[] {
  const directory = path.join(workspaceRoot, relativeDirectory);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return findCssFiles(relativePath);
    return entry.isFile() && entry.name.endsWith('.css') ? [relativePath] : [];
  });
}

test('editorial responsive: keeps one main landmark and accessible shared controls', () => {
  const layout = read('apps/frontend/app/layout.tsx');
  const globals = read('apps/frontend/app/globals.css');
  const newsTabsCss = read('apps/frontend/components/news/NewsTabs.module.css');
  const headerCss = read('apps/frontend/components/layout/Header.module.css');
  const footerCss = read('apps/frontend/components/layout/Footer.module.css');
  const routeSources = [
    'apps/frontend/app/not-found.tsx',
    'apps/frontend/app/ban-tin/page.tsx',
    'apps/frontend/app/ban-tin/loading.tsx',
    'apps/frontend/app/ban-tin/error.tsx',
    'apps/frontend/app/ban-tin/not-found.tsx',
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/loading.tsx',
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/error.tsx',
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/not-found.tsx',
    'apps/frontend/app/ban-tin/[articleSlug]/page.tsx',
    'apps/frontend/app/ban-tin/[articleSlug]/loading.tsx',
    'apps/frontend/app/ban-tin/[articleSlug]/error.tsx',
    'apps/frontend/app/ban-tin/[articleSlug]/not-found.tsx',
  ]
    .map(readOptional)
    .join('\n');

  assert.equal((layout.match(/<main\b/g) ?? []).length, 1);
  assert.doesNotMatch(routeSources, /<main\b/g);
  assert.match(newsTabsCss, /overflow-x:\s*auto/);
  assert.match(newsTabsCss, /\.tab\s*\{[^}]*min-height:\s*44px/);
  assert.match(globals, /:focus-visible\s*\{/);
  assert.match(globals, /prefers-reduced-motion:\s*reduce/);
  assert.match(headerCss, /\.brand\s*\{[^}]*min-height:\s*44px/);
  assert.match(footerCss, /\.brand\s*\{[^}]*min-height:\s*44px/);
  assert.match(footerCss, /\.legal a\s*\{[^}]*min-height:\s*44px/);
});

test('editorial responsive: contains width without masking page overflow', () => {
  const globals = read('apps/frontend/app/globals.css');
  const overviewCss = read('apps/frontend/app/ban-tin/page.module.css');
  const categoryCss = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.module.css',
  );
  const articleCss = read(
    'apps/frontend/app/ban-tin/[articleSlug]/page.module.css',
  );
  const featuredCss = read(
    'apps/frontend/components/news/FeaturedNews.module.css',
  );
  const directoryCss = read(
    'apps/frontend/components/news/CategoryDirectory.module.css',
  );
  const articleContentCss = read(
    'apps/frontend/components/news/ArticleContent.module.css',
  );
  const sourceEvidenceCss = read(
    'apps/frontend/components/news/SourceEvidence.module.css',
  );
  const horizontallyScrollingCss = [
    ...findCssFiles('apps/frontend/app'),
    ...findCssFiles('apps/frontend/components'),
  ]
    .filter((relativePath) =>
      /overflow-x:\s*(?:auto|scroll)/.test(read(relativePath)),
    )
    .map((relativePath) => relativePath.replaceAll('\\', '/'));
  assert.doesNotMatch(globals, /body\s*\{[^}]*overflow-x:\s*hidden/);
  assert.doesNotMatch(overviewCss, /\.page\s*\{[^}]*overflow:\s*clip/);
  assert.doesNotMatch(categoryCss, /\.page\s*\{[^}]*overflow:\s*clip/);
  assert.doesNotMatch(articleCss, /\.page\s*\{[^}]*overflow:\s*clip/);
  assert.deepEqual(horizontallyScrollingCss, [
    'apps/frontend/components/news/NewsTabs.module.css',
  ]);

  assert.match(overviewCss, /\.contentGrid\s*\{[^}]*min-width:\s*0/);
  assert.match(categoryCss, /\.contentGrid\s*\{[^}]*min-width:\s*0/);
  assert.match(articleCss, /\.articleGrid\s*\{[^}]*min-width:\s*0/);
  assert.match(featuredCss, /\.featured\s*\{[^}]*min-width:\s*0/);
  assert.match(directoryCss, /\.panel\s*\{[^}]*min-width:\s*0/);
  assert.match(articleContentCss, /\.content a\s*\{[^}]*overflow-wrap:\s*anywhere/);
  assert.match(sourceEvidenceCss, /\.evidence a\s*\{[^}]*overflow-wrap:\s*anywhere/);

  assert.match(
    overviewCss,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.contentGrid\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    categoryCss,
    /@media\s*\(max-width:\s*1023px\)[\s\S]*?\.contentGrid\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    articleCss,
    /@media\s*\(max-width:\s*1199px\)[\s\S]*?\.articleGrid\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    featuredCss,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.featured\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    directoryCss,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.panel\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
});

test('editorial responsive: every news image inherits an intentional sizes contract', () => {
  const boundary = read('apps/frontend/components/news/NewsImage.tsx');
  const card = read('apps/frontend/components/news/NewsCard.tsx');
  const article = read('apps/frontend/app/ban-tin/[articleSlug]/page.tsx');

  assert.match(boundary, /sizes\s*=\s*'\(max-width:\s*768px\)\s*100vw,\s*50vw'/);
  assert.match(boundary, /<Image[\s\S]*sizes=\{sizes\}/);
  assert.match(card, /<NewsImage[\s\S]*sizes=\{IMAGE_SIZES\[variant\]\}/);
  assert.match(
    article,
    /<NewsImage[\s\S]*sizes="\(max-width:\s*1199px\)\s*100vw,\s*820px"/,
  );
});

test('editorial responsive: loading, errors, and not-found states match each route', () => {
  const overviewLoading = read('apps/frontend/app/ban-tin/loading.tsx');
  const categoryLoading = readOptional(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/loading.tsx',
  );
  const articleLoading = readOptional(
    'apps/frontend/app/ban-tin/[articleSlug]/loading.tsx',
  );
  const states = read('apps/frontend/components/news/NewsStates.tsx');
  const errors = [
    read('apps/frontend/app/ban-tin/error.tsx'),
    readOptional('apps/frontend/app/ban-tin/chuyen-muc/[slug]/error.tsx'),
    readOptional('apps/frontend/app/ban-tin/[articleSlug]/error.tsx'),
  ];
  const notFoundStates = [
    readOptional('apps/frontend/app/ban-tin/not-found.tsx'),
    readOptional('apps/frontend/app/ban-tin/chuyen-muc/[slug]/not-found.tsx'),
    readOptional('apps/frontend/app/ban-tin/[articleSlug]/not-found.tsx'),
  ];

  assert.match(overviewLoading, /OverviewLoadingSkeleton/);
  assert.match(categoryLoading, /CategoryLoadingSkeleton/);
  assert.match(articleLoading, /ArticleLoadingSkeleton/);
  assert.match(states, /Array\.from\(\{\s*length:\s*2\s*\}/);
  assert.match(states, /aria-hidden="true"/);
  assert.match(states, /aria-busy="true"/);
  assert.match(
    states,
    /export function ErrorPanel[\s\S]*?<h1 className=\{styles\.stateTitle\}>/,
  );

  for (const errorSource of errors) {
    assert.match(errorSource, /reset\(\)/);
    assert.match(errorSource, /href="\/ban-tin"/);
  }

  for (const notFoundSource of notFoundStates) {
    assert.match(notFoundSource, /href="\/ban-tin"/);
  }
});
