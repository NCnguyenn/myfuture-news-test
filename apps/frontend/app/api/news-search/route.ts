import { NextResponse } from 'next/server';
import { ApiClientError, getArticles } from '../../../lib/api-client';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') ?? '').trim();
  const requestedLimit = Number(url.searchParams.get('limit') ?? '6');
  const limit = Math.max(
    1,
    Math.min(6, Number.isFinite(requestedLimit) ? requestedLimit : 6),
  );

  if (query.length < 2 || query.length > 100) {
    return NextResponse.json(
      {
        message: 'Từ khóa tìm kiếm phải có từ 2 đến 100 ký tự.',
        code: 'INVALID_SEARCH_QUERY',
      },
      { status: 400 },
    );
  }

  try {
    const response = await getArticles({ q: query, page: 1, limit });
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status },
      );
    }
    return NextResponse.json(
      {
        message: 'Tìm kiếm đang tạm thời gián đoạn. Vui lòng thử lại.',
        code: 'SEARCH_UNAVAILABLE',
      },
      { status: 503 },
    );
  }
}
