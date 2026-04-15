/**
 * JSON shapes from `docs/06-api.md` (success, pagination, error, warnings).
 */

/** Success: `{ "data": T }` */
export type ApiResponse<T> = {
  data: T;
};

/** Paginated list */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

/** Error body: `{ "error": string }` */
export type ApiErrorBody = {
  error: string;
};

/** Success with optional warnings (e.g. relationship validation) */
export type ApiResponseWithWarnings<T> = {
  data: T;
  warnings?: string[];
};
