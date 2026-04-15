import ky from "ky";
import {
  getMemoryToken,
  LS_TOKEN_KEY,
  setMemoryToken,
} from "../lib/auth-token-store.js";

function loginPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    try {
      return new URL(url, window.location.origin).pathname;
    } catch {
      return "";
    }
  }
}

const isLoginRequest = (url: string) =>
  loginPathname(url).endsWith("/api/auth/login");

const isDisabledMessage = (errorText: string) =>
  errorText.toLowerCase().includes("приостановлен");

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  hooks: {
    beforeRequest: [
      (request) => {
        const t = getMemoryToken();
        if (t) {
          request.headers.set("Authorization", `Bearer ${t}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401 && !isLoginRequest(request.url)) {
          setMemoryToken(null);
          localStorage.removeItem(LS_TOKEN_KEY);
          if (!window.location.pathname.startsWith("/login")) {
            window.location.assign("/login");
          }
        }

        if (response.status === 403) {
          try {
            const body = (await response.clone().json()) as { error?: string };
            if (body.error && isDisabledMessage(body.error)) {
              window.location.assign("/disabled");
            }
          } catch {
            /* не JSON */
          }
        }
      },
    ],
  },
});
