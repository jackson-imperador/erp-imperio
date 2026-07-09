export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
): PaginatedResult<T> {
  const pageCount = Math.ceil(total / perPage);
  return {
    data,
    meta: {
      total,
      page,
      perPage,
      pageCount,
      hasNextPage: page < pageCount,
      hasPreviousPage: page > 1,
    },
  };
}

export function getPaginationSkip(page: number, perPage: number): number {
  return (page - 1) * perPage;
}
