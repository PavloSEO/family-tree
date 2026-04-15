/** Ключ в `localStorage` при «Запомнить меня» (`docs/07-auth.md`). */
export const LS_TOKEN_KEY = "ft_token";

let memoryToken: string | null = null;

export function getMemoryToken(): string | null {
  return memoryToken;
}

export function setMemoryToken(token: string | null): void {
  memoryToken = token;
}
