import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMG = {
  p1: '/images/news/placeholder-01.svg',
  p2: '/images/news/placeholder-02.svg',
  p3: '/images/news/placeholder-03.svg',
  def: '/images/news/placeholder-default.svg',
} as const;

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

/** Six real Categories only — Overview is UI-only (never seeded). */
const CATEGORIES: CategorySeed[] = [
  {
    name: 'Pháp lý dự án',
    slug: 'phap-ly-du-an',
    description: 'Quy định, giấy phép và rủi ro pháp lý liên quan đến dự án bất động sản.',
    sortOrder: 1,
  },
  {
    name: 'Quy hoạch hạ tầng',
    slug: 'quy-hoach-ha-tang',
    description: 'Quy hoạch đô thị, hạ tầng giao thông và tiện ích công cộng.',
    sortOrder: 2,
  },
  {
    name: 'Lãi suất tài chính',
    slug: 'lai-suat-tai-chinh',
    description: 'Lãi suất vay, tín dụng và chính sách tài chính liên quan bất động sản.',
    sortOrder: 3,
  },
  {
    name: 'Thị trường giá cả',
    slug: 'thi-truong-gia-ca',
    description: 'Diễn biến giá, cung cầu và xu hướng thị trường.',
    sortOrder: 4,
  },
  {
    name: 'Đầu tư dòng tiền',
    slug: 'dau-tu-dong-tien',
    description: 'Chiến lược đầu tư, dòng tiền và phân tích lợi nhuận.',
    sortOrder: 5,
  },
  {
    name: 'Cho thuê',
    slug: 'cho-thue',
    description: 'Thị trường cho thuê, lợi suất và quản lý tài sản cho thuê.',
    sortOrder: 6,
  },
];

type ArticleSeed = {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  thumbnailUrl: string;
  coverImageUrl: string | null;
  publishedAt: Date;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  readingTime: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  categorySlug: string;
};

function daysAgo(days: number): Date {
  const d = new Date('2026-07-20T10:00:00.000Z');
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function shortHtml(title: string, body: string): string {
  return `<article><h1>${title}</h1><p>${body}</p><p>Nội dung demo phục vụ kiểm thử module Bản tin MyFuture.</p></article>`;
}

function longHtml(title: string): string {
  const paragraphs = Array.from({ length: 8 }, (_, i) => {
    return `<p>Đoạn ${i + 1}: Bài viết mẫu dài hơn để kiểm tra render contentHtml, thời gian đọc và layout trang chi tiết. ` +
      `Thông tin mang tính minh họa, không phải tư vấn đầu tư. Các yếu tố pháp lý, quy hoạch, lãi suất và dòng tiền ` +
      `cần được đối chiếu với nguồn chính thức trước khi ra quyết định.</p>`;
  }).join('');
  return `<article><h1>${title}</h1>${paragraphs}<ul><li>Điểm chính 1</li><li>Điểm chính 2</li><li>Điểm chính 3</li></ul></article>`;
}

/**
 * Article plan:
 * - phap-ly-du-an: 12 published (+1 unpublished) — pagination category
 * - quy-hoach-ha-tang: 4 published
 * - lai-suat-tai-chinh: 3 published
 * - thi-truong-gia-ca: 4 published
 * - dau-tu-dong-tien: 3 published
 * - cho-thue: 3 published
 * Featured across multiple categories; mix of images, default image, sources, long content.
 */
function buildArticles(): ArticleSeed[] {
  const articles: ArticleSeed[] = [];

  // --- Pháp lý dự án: 12 published for pagination + 1 unpublished ---
  for (let i = 1; i <= 12; i++) {
    const title = `Cập nhật pháp lý dự án #${i}: giấy phép và nghĩa vụ chủ đầu tư`;
    const useLong = i % 4 === 0;
    const img =
      i % 5 === 0 ? IMG.def : i % 3 === 1 ? IMG.p1 : i % 3 === 2 ? IMG.p2 : IMG.p3;
    articles.push({
      title,
      slug: `phap-ly-du-an-bai-${String(i).padStart(2, '0')}`,
      excerpt: `Tóm tắt pháp lý dự án số ${i}: điều kiện pháp lý, rủi ro và checklist kiểm tra trước khi giao dịch.`,
      contentHtml: useLong
        ? longHtml(title)
        : shortHtml(title, `Nội dung ngắn về pháp lý dự án số ${i}.`),
      thumbnailUrl: img,
      coverImageUrl: i % 2 === 0 ? img : null,
      publishedAt: daysAgo(i),
      isPublished: true,
      isFeatured: i === 1 || i === 5 || i === 9,
      viewCount: 100 + i * 17,
      readingTime: useLong ? 8 : 3,
      sourceName: i % 3 === 0 ? 'Bộ Xây dựng' : null,
      sourceUrl: i % 3 === 0 ? 'https://example.com/source/phap-ly' : null,
      categorySlug: 'phap-ly-du-an',
    });
  }
  articles.push({
    title: 'Bản nháp pháp lý (chưa xuất bản)',
    slug: 'phap-ly-du-an-draft-unpublished',
    excerpt: 'Bài nháp dùng để kiểm tra isPublished=false không lộ public API.',
    contentHtml: shortHtml(
      'Bản nháp pháp lý (chưa xuất bản)',
      'Bài này không được xuất bản.',
    ),
    thumbnailUrl: IMG.def,
    coverImageUrl: null,
    publishedAt: daysAgo(0),
    isPublished: false,
    isFeatured: false,
    viewCount: 0,
    readingTime: 2,
    sourceName: null,
    sourceUrl: null,
    categorySlug: 'phap-ly-du-an',
  });

  // --- Quy hoạch hạ tầng: 4 published ---
  const quyHoach = [
    {
      n: 1,
      featured: true,
      img: IMG.p1,
      cover: IMG.p1,
      source: true,
      long: false,
    },
    {
      n: 2,
      featured: false,
      img: IMG.p2,
      cover: null as string | null,
      source: false,
      long: true,
    },
    {
      n: 3,
      featured: false,
      img: IMG.def,
      cover: null as string | null,
      source: false,
      long: false,
    },
    {
      n: 4,
      featured: true,
      img: IMG.p3,
      cover: IMG.p3,
      source: true,
      long: false,
    },
  ];
  for (const row of quyHoach) {
    const title = `Quy hoạch hạ tầng số ${row.n}: kết nối giao thông và tiện ích`;
    articles.push({
      title,
      slug: `quy-hoach-ha-tang-bai-0${row.n}`,
      excerpt: `Diễn biến quy hoạch và hạ tầng số ${row.n} ảnh hưởng giá trị khu vực.`,
      contentHtml: row.long
        ? longHtml(title)
        : shortHtml(title, `Nội dung quy hoạch hạ tầng ${row.n}.`),
      thumbnailUrl: row.img,
      coverImageUrl: row.cover,
      publishedAt: daysAgo(row.n + 2),
      isPublished: true,
      isFeatured: row.featured,
      viewCount: 80 + row.n * 11,
      readingTime: row.long ? 7 : 3,
      sourceName: row.source ? 'Sở QH-KT' : null,
      sourceUrl: row.source ? 'https://example.com/source/quy-hoach' : null,
      categorySlug: 'quy-hoach-ha-tang',
    });
  }

  // --- Lãi suất tài chính: 3 published ---
  for (let i = 1; i <= 3; i++) {
    const title = `Lãi suất và tín dụng BĐS #${i}`;
    articles.push({
      title,
      slug: `lai-suat-tai-chinh-bai-0${i}`,
      excerpt: `Cập nhật lãi suất vay mua nhà và chính sách tín dụng số ${i}.`,
      contentHtml:
        i === 2
          ? longHtml(title)
          : shortHtml(title, `Phân tích lãi suất số ${i}.`),
      thumbnailUrl: i === 3 ? IMG.def : IMG.p1,
      coverImageUrl: i === 1 ? IMG.p1 : null,
      publishedAt: daysAgo(i + 5),
      isPublished: true,
      isFeatured: i === 1,
      viewCount: 60 + i * 9,
      readingTime: i === 2 ? 6 : 3,
      sourceName: i === 1 ? 'NHNN' : null,
      sourceUrl: i === 1 ? 'https://example.com/source/lai-suat' : null,
      categorySlug: 'lai-suat-tai-chinh',
    });
  }

  // --- Thị trường giá cả: 4 published ---
  for (let i = 1; i <= 4; i++) {
    const title = `Thị trường giá cả khu vực #${i}`;
    articles.push({
      title,
      slug: `thi-truong-gia-ca-bai-0${i}`,
      excerpt: `Biến động giá và thanh khoản thị trường số ${i}.`,
      contentHtml: shortHtml(title, `Diễn biến giá số ${i}.`),
      thumbnailUrl: i % 2 === 0 ? IMG.p2 : IMG.p3,
      coverImageUrl: i === 2 ? IMG.p2 : null,
      publishedAt: daysAgo(i + 8),
      isPublished: true,
      isFeatured: i === 2,
      viewCount: 90 + i * 13,
      readingTime: 4,
      sourceName: i === 4 ? 'Batdongsan Demo' : null,
      sourceUrl: i === 4 ? 'https://example.com/source/gia-ca' : null,
      categorySlug: 'thi-truong-gia-ca',
    });
  }

  // --- Đầu tư dòng tiền: 3 published ---
  for (let i = 1; i <= 3; i++) {
    const title = `Chiến lược đầu tư dòng tiền #${i}`;
    articles.push({
      title,
      slug: `dau-tu-dong-tien-bai-0${i}`,
      excerpt: `Mô hình dòng tiền và ROI minh họa số ${i}.`,
      contentHtml:
        i === 3
          ? longHtml(title)
          : shortHtml(title, `Phân tích dòng tiền số ${i}.`),
      thumbnailUrl: i === 1 ? IMG.def : IMG.p1,
      coverImageUrl: i === 2 ? IMG.p1 : null,
      publishedAt: daysAgo(i + 12),
      isPublished: true,
      isFeatured: i === 3,
      viewCount: 70 + i * 7,
      readingTime: i === 3 ? 9 : 3,
      sourceName: null,
      sourceUrl: null,
      categorySlug: 'dau-tu-dong-tien',
    });
  }

  // --- Cho thuê: 3 published ---
  for (let i = 1; i <= 3; i++) {
    const title = `Thị trường cho thuê và lợi suất #${i}`;
    articles.push({
      title,
      slug: `cho-thue-bai-0${i}`,
      excerpt: `Lợi suất cho thuê và xu hướng khách thuê số ${i}.`,
      contentHtml: shortHtml(title, `Cập nhật cho thuê số ${i}.`),
      thumbnailUrl: i === 2 ? IMG.def : IMG.p3,
      coverImageUrl: i === 1 ? IMG.p3 : null,
      publishedAt: daysAgo(i + 15),
      isPublished: true,
      isFeatured: i === 1,
      viewCount: 55 + i * 5,
      readingTime: 3,
      sourceName: i === 3 ? 'Property Demo' : null,
      sourceUrl: i === 3 ? 'https://example.com/source/cho-thue' : null,
      categorySlug: 'cho-thue',
    });
  }

  return articles;
}

async function main() {
  console.log('Seeding categories (upsert by slug)...');

  const categoryIdBySlug = new Map<string, string>();

  for (const cat of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryIdBySlug.set(cat.slug, row.id);
  }

  const articles = buildArticles();
  console.log(`Seeding ${articles.length} articles (upsert by slug)...`);

  for (const article of articles) {
    const categoryId = categoryIdBySlug.get(article.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug: ${article.categorySlug}`);
    }

    await prisma.article.upsert({
      where: { slug: article.slug },
      create: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        contentHtml: article.contentHtml,
        thumbnailUrl: article.thumbnailUrl,
        coverImageUrl: article.coverImageUrl,
        publishedAt: article.publishedAt,
        isPublished: article.isPublished,
        isFeatured: article.isFeatured,
        viewCount: article.viewCount,
        readingTime: article.readingTime,
        sourceName: article.sourceName,
        sourceUrl: article.sourceUrl,
        categoryId,
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        contentHtml: article.contentHtml,
        thumbnailUrl: article.thumbnailUrl,
        coverImageUrl: article.coverImageUrl,
        publishedAt: article.publishedAt,
        isPublished: article.isPublished,
        isFeatured: article.isFeatured,
        viewCount: article.viewCount,
        readingTime: article.readingTime,
        sourceName: article.sourceName,
        sourceUrl: article.sourceUrl,
        categoryId,
      },
    });
  }

  const categoryCount = await prisma.category.count();
  const articleCount = await prisma.article.count();
  const publishedCount = await prisma.article.count({ where: { isPublished: true } });
  const featuredCount = await prisma.article.count({
    where: { isFeatured: true, isPublished: true },
  });
  const unpublishedCount = await prisma.article.count({
    where: { isPublished: false },
  });

  const perCategory = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      slug: true,
      name: true,
      _count: { select: { articles: true } },
    },
  });

  console.log('--- Seed summary ---');
  console.log(`Categories: ${categoryCount} (expected 6)`);
  console.log(`Articles total: ${articleCount}`);
  console.log(`Published: ${publishedCount}`);
  console.log(`Featured (published): ${featuredCount}`);
  console.log(`Unpublished: ${unpublishedCount}`);
  for (const c of perCategory) {
    console.log(`  ${c.slug}: ${c._count.articles} articles`);
  }
  console.log('Seed completed.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
