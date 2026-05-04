import crypto from 'crypto';

export function generateCursor(data: any): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function parseCursor(cursor: string): any {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export function buildPaginatedResponse<T>(items: T[], hasMore: boolean, nextCursor?: string) {
  return {
    data: items,
    pagination: {
      cursor: nextCursor,
      has_more: hasMore,
    },
  };
}
