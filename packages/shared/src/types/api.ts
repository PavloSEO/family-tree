/**
 * JSON shapes from `docs/06-api.md` (успех, пагинация, ошибка, предупреждения).
 */

/** Успешный ответ: `{ "data": T }` */
export type ApiResponse<T> = {
  data: T;
};

/** Список с пагинацией */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

/** Тело ошибки: `{ "error": string }` */
export type ApiErrorBody = {
  error: string;
};

/** Успех с необязательными предупреждениями (например валидация связей) */
export type ApiResponseWithWarnings<T> = {
  data: T;
  warnings?: string[];
};
