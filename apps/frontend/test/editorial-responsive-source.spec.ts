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

function cssBlock(source: string, header: RegExp): string {
  const match = header.exec(source);
  assert.ok(match, `Missing CSS block matching ${header}`);
  const openingBrace = source.indexOf('{', match.index + match[0].length);
  assert.notEqual(openingBrace, -1, `Missing opening brace after ${header}`);

  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  assert.fail(`Missing closing brace after ${header}`);
}

function exportedFunction(source: string, name: string): string {
  const start = source.indexOf(`export function ${name}`);
  assert.notEqual(start, -1, `Missing exported function ${name}`);
  const nextExport = source.indexOf('\nexport function ', start + 1);
  return source.slice(start, nextExport === -1 ? source.length : nextExport);
}

test('editorial responsive: keeps one main landmark and accessible shared controls', () => {
  const layout = read('apps/frontend/app/layout.tsx');
  const globals = read('apps/frontend/app/globals.css');
  const newsTabsCss = read('apps/frontend/components/news/NewsTabs.module.css');
  const newsTabsDefault = newsTabsCss.slice(0, newsTabsCss.indexOf('@media'));
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
  assert.match(
    newsTabsDefault,
    /\.tabs\s*\{[^}]*overflow-x:\s*auto[^}]*overflow-y:\s*hidden/,
  );
  assert.doesNotMatch(newsTabsDefault, /\.tabs\s*\{[^}]*overflow:\s*hidden/);
  assert.match(newsTabsDefault, /\.tabs\s*\{[^}]*scroll-padding-inline:/);
  assert.match(newsTabsDefault, /\.track\s*\{[^}]*padding:/);
  assert.match(newsTabsDefault, /\.tab\s*\{[^}]*min-height:\s*44px/);
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

  const overviewMobile = cssBlock(
    overviewCss,
    /@media\s*\(max-width:\s*767px\)/,
  );
  const categoryTablet = cssBlock(
    categoryCss,
    /@media\s*\(max-width:\s*1023px\)/,
  );
  const articleTablet = cssBlock(
    articleCss,
    /@media\s*\(max-width:\s*1199px\)/,
  );
  const featuredMobile = cssBlock(
    featuredCss,
    /@media\s*\(max-width:\s*767px\)/,
  );
  const directoryMobile = cssBlock(
    directoryCss,
    /@media\s*\(max-width:\s*767px\)/,
  );

  assert.match(
    overviewMobile,
    /\.contentGrid\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    categoryTablet,
    /\.contentGrid\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    articleTablet,
    /\.articleGrid\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    featuredMobile,
    /\.featured\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    directoryMobile,
    /\.panel\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
});

test('editorial responsive: every news image inherits an intentional sizes contract', () => {
  const boundary = read('apps/frontend/components/news/NewsImage.tsx');
  const card = read('apps/frontend/components/news/NewsCard.tsx');
  const article = read('apps/frontend/app/ban-tin/[articleSlug]/page.tsx');

  assert.match(boundary, /sizes\s*=\s*'\(max-width:\s*768px\)\s*100vw,\s*50vw'/);
  assert.match(boundary, /<Image[\s\S]*sizes=\{sizes\}/);
  assert.match(card, /<NewsImage[\s\S]*sizes=\{IMAGE_SIZES\[variant\]\}/);
  assert.match(card, /lead:\s*'\(max-width: 768px\) 100vw, 66vw'/);
  assert.match(
    card,
    /supporting:\s*'\(max-width: 360px\) 96px, \(max-width: 768px\) 112px, 34vw'/,
  );
  assert.match(
    card,
    /feed:\s*'\(max-width: 360px\) 96px, \(max-width: 768px\) 112px, 230px'/,
  );
  assert.match(card, /compact:\s*'\(max-width: 360px\) 96px, 112px'/);
  assert.match(
    card,
    /related:\s*'\(max-width: 600px\) 100vw, \(max-width: 850px\) 50vw, 33vw'/,
  );
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
  const statesCss = read('apps/frontend/components/news/NewsStates.module.css');
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
  const overviewSkeleton = exportedFunction(
    states,
    'OverviewLoadingSkeleton',
  );
  assert.match(
    overviewSkeleton,
    /Array\.from\(\{\s*length:\s*2\s*\}/,
  );
  assert.match(
    states,
    /function SkeletonBlock[\s\S]*?aria-hidden="true"[\s\S]*?\n\}/,
  );
  assert.match(
    statesCss,
    /\.srOnly\s*\{[^}]*position:\s*absolute[^}]*width:\s*1px[^}]*height:\s*1px[^}]*overflow:\s*hidden/,
  );

  const loadingContracts = [
    ['OverviewLoadingSkeleton', 'Đang tải trang tổng quan Bản tin'],
    ['CategoryLoadingSkeleton', 'Đang tải chuyên mục'],
    ['ArticleLoadingSkeleton', 'Đang tải bài viết'],
  ] as const;

  for (const [name, loadingText] of loadingContracts) {
    const skeleton = exportedFunction(states, name);
    assert.match(skeleton, /role="status"/);
    assert.match(skeleton, /aria-busy="true"/);
    assert.match(skeleton, /aria-hidden="true"/);
    assert.equal(
      (skeleton.match(/className=\{styles\.srOnly\}/g) ?? []).length,
      1,
    );
    assert.match(
      skeleton,
      new RegExp(
        `<span className=\\{styles\\.srOnly\\}>\\s*${loadingText}\\s*</span>`,
      ),
    );
  }

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

test('editorial responsive: category breadcrumb is a labelled ordered navigation', () => {
  const category = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.tsx',
  );
  const categoryCss = read(
    'apps/frontend/app/ban-tin/chuyen-muc/[slug]/page.module.css',
  );
  const breadcrumb = category.match(
    /<nav\b[\s\S]*?className=\{styles\.breadcrumb\}[\s\S]*?<\/nav>/,
  )?.[0];

  assert.ok(breadcrumb, 'Missing category breadcrumb navigation');
  assert.match(breadcrumb, /aria-label="Đường dẫn"/);
  assert.match(breadcrumb, /<ol>/);
  assert.match(breadcrumb, /<li>\s*<Link href="\/ban-tin">/);
  assert.match(breadcrumb, /<li aria-current="page">\{category\.name\}<\/li>/);
  assert.doesNotMatch(breadcrumb, />\s*\/\s*</);
  assert.match(
    categoryCss,
    /\.breadcrumb li \+ li::before\s*\{[^}]*content:\s*['"]\/['"]/,
  );
});
