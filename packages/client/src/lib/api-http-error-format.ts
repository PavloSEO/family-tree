import { HTTPError } from "ky";
import i18n from "../i18n.js";

/** Cyrillic in API error text (default product locale). */
const CYRILLIC = /[\u0400-\u04FF]/;

function isEnUi(): boolean {
  const lng = i18n.language ?? "";
  return !lng.toLowerCase().startsWith("ru");
}

/**
 * When UI is English and the API message contains Russian text, prefix it so
 * the user sees a labeled string instead of raw RU (i18n plan §16).
 * RU UI: leave `error.message` unchanged (typically `body.error` from server).
 */
export async function localizeApiHttpError(error: HTTPError): Promise<HTTPError> {
  if (!isEnUi()) {
    return error;
  }

  const { response } = error;
  let text = "";

  if (response) {
    try {
      const ct = response.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const body = (await response.clone().json()) as { error?: string };
        if (body?.error && typeof body.error === "string") {
          const trimmed = body.error.trim();
          if (trimmed) {
            text = trimmed;
          }
        }
      }
    } catch {
      /* not JSON */
    }
  }

  if (!text) {
    text = (error.message ?? "").trim();
  }

  if (text.length > 0 && CYRILLIC.test(text)) {
    error.message = i18n.t("serverMessageRu", { ns: "errors", text });
  }

  return error;
}
