import { HTTPError } from "ky";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type Location, useLocation, useNavigate } from "react-router-dom";
import { UiLangSwitch } from "../components/layout/UiLangSwitch.js";
import { MdButton, MdTextField } from "../components/md/index.js";
import { useAuth } from "../hooks/useAuth.js";

function accountSuspendedMessage(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("приостановлен") ||
    m.includes("suspended") ||
    m.includes("disabled")
  );
}

export function LoginPage() {
  const { t } = useTranslation("auth");
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: Location } | null)?.from?.pathname ?? "/";

  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && user) {
      navigate(from, { replace: true });
    }
  }, [ready, user, from, navigate]);

  async function handleSubmit() {
    setError(null);
    setPending(true);
    try {
      await login({
        login: loginField.trim(),
        password,
        remember,
      });
      navigate(from, { replace: true });
    } catch (e) {
      if (e instanceof HTTPError) {
        const st = e.response.status;
        let body: { error?: string } = {};
        try {
          body = (await e.response.json()) as { error?: string };
        } catch {
          /* not JSON */
        }
        const msg = body.error?.toLowerCase() ?? "";
        if (st === 403 && accountSuspendedMessage(msg)) {
          navigate("/disabled", { replace: true });
          return;
        }
        if (st === 429) {
          setError(body.error ?? t("rateLimitFallback"));
        } else if (st === 401) {
          setError(t("invalidCredentials"));
        } else {
          setError(body.error ?? t("loginFailedGeneric"));
        }
      } else {
        setError(t("networkError"));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <UiLangSwitch />
      </div>
      <h1 className="md-typescale-display-medium">{t("productTitle")}</h1>
      <form
        className="flex w-full max-w-sm flex-col gap-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          void handleSubmit();
        }}
      >
        <MdTextField
          label={t("loginLabel")}
          value={loginField}
          required
          onValueChange={setLoginField}
        />
        <MdTextField
          label={t("passwordLabel")}
          type="password"
          value={password}
          required
          onValueChange={setPassword}
        />
        <label className="flex items-center gap-2">
          <md-checkbox
            checked={remember}
            onInput={(e) => {
              const t = e.currentTarget as unknown as { checked: boolean };
              setRemember(Boolean(t.checked));
            }}
          />
          <span className="md-typescale-body-medium">{t("rememberMe")}</span>
        </label>
        {error ? (
          <p
            className="md-typescale-body-small"
            style={{ color: "var(--md-sys-color-error)" }}
          >
            {error}
          </p>
        ) : null}
        <MdButton type="submit" disabled={pending}>
          <md-icon slot="icon" className="material-symbols-outlined">
            login
          </md-icon>
          {t("signIn")}
        </MdButton>
      </form>
    </div>
  );
}
